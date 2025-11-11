import { GoogleGenAI } from "@google/genai";
import {
  RoadmapPhase,
  SkillRoadmapContent,
  GenerateSkillRoadmap,
  kanbanTaskGenerationSchema,
  KanbanTaskGeneration,
  UserRoadmapHistory,
} from "@shared/schema";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Robust JSON parsing helper:
 * - Attempts JSON.parse
 * - If parse fails, tries to find first "{" and last "}" (or "[" and "]")
 * - Returns parsed object or throws with debug info
 */
function parseJsonSafely(raw: string) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    // try to salvage JSON: find first { or [ and last } or ]
    const firstBrace = Math.min(
      ...["{", "["]
        .map((c) => raw.indexOf(c))
        .filter((i) => i >= 0)
    );
    const lastBrace = Math.max(
      ...["}", "]"]
        .map((c) => raw.lastIndexOf(c))
        .filter((i) => i >= 0)
    );

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const candidate = raw.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (err2) {
        const snippet = raw.substring(0, 2000);
        throw new Error(
          `Failed to parse JSON. Original parse error: ${err}. Salvage attempt failed. Raw start: ${snippet}`
        );
      }
    }

    const snippet = raw.substring(0, 2000);
    throw new Error(
      `Failed to parse JSON and no salvageable braces found. Original parse error: ${err}. Raw start: ${snippet}`
    );
  }
}

/**
 * Retry with exponential backoff + jitter and model fallback.
 * Handles 429/503/500/404 by retrying. Switches model if flash overload occurs.
 */
async function retryWithBackoff<T>(
  fn: (model: string) => Promise<T>,
  maxRetries = 5,
  initialDelay = 800
): Promise<T> {
  const models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5"]; // fallback order
  let attempt = 0;
  let lastErr: any = null;
  // cycle across models as needed
  for (; attempt < maxRetries; attempt++) {
    const model = models[Math.min(attempt, models.length - 1)];
    try {
      return await fn(model);
    } catch (error: any) {
      lastErr = error;
      const status = error?.status || error?.response?.status || null;
      // If model-specific overload, try next model quickly
      if ((status === 503 || status === 429) && attempt < maxRetries - 1) {
        const backoff = Math.round(initialDelay * Math.pow(2, attempt) * (0.8 + Math.random() * 0.4));
        console.warn(
          `Model request failed (status=${status}) on model=${model}. Retrying after ${backoff}ms (attempt ${
            attempt + 1
          }/${maxRetries}).`
        );
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      // For other errors, rethrow
      throw error;
    }
  }
  throw lastErr;
}

export async function generateRoadmap(
  currentCourse: string,
  targetRole: string
): Promise<RoadmapPhase[]> {
  try {
    // Keep prompt concise and explicit about JSON-only output
    const systemPrompt = `You are CareerRoad AI, an expert career mentor. Output ONLY valid JSON (no explanation).
Return a JSON array of exactly 3 phases. Each phase object must have: title (string), duration_weeks (integer),
items (array of 4-6 objects). Each item: { type: "resource"|"tool"|"task"|"community", label:string (<=80 chars),
description:string (<=150 chars), link: optional http(s) URL or empty string }.
Focus on practical, India-relevant resources and companies where appropriate.`;

    const userPrompt = `Create a concise 3-phase career roadmap: from "${currentCourse}" to "${targetRole}".
Phase 1: Foundation (4-6 weeks), Phase 2: Skill Building (6-8 weeks), Phase 3: Career Preparation (4-6 weeks).
Return ONLY the JSON array described in the system prompt.`;

    const response = await retryWithBackoff((model) =>
      ai.models.generateContent({
        model,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          // keep temperature low for deterministic output
          temperature: 0.0,
          // limit output length so model won't produce huge content
          maxOutputTokens: 800,
        },
        contents: userPrompt,
      })
    );

    // the SDK may return response.text or other shape, handle both
    const rawJson = (response as any)?.text ?? (response as any)?.candidates?.[0]?.content?.[0]?.text ?? "";

    if (!rawJson || rawJson.trim().length === 0) {
      throw new Error("Empty response from Gemini");
    }

    // Attempt robust JSON parse
    const parsed = parseJsonSafely(rawJson);

    if (!Array.isArray(parsed) || parsed.length !== 3) {
      throw new Error("Unexpected roadmap structure: must be an array of three phases");
    }

    // Optional lightweight validation of each phase shape
    parsed.forEach((p: any, idx: number) => {
      if (typeof p.title !== "string" || typeof p.duration_weeks !== "number" || !Array.isArray(p.items)) {
        throw new Error(`Phase ${idx + 1} missing required fields`);
      }
    });

    return parsed as RoadmapPhase[];
  } catch (error) {
    console.error("Failed to generate roadmap:", error);
    throw new Error(`Failed to generate roadmap: ${String(error)}`);
  }
}

export async function generateSkillRoadmap(params: GenerateSkillRoadmap): Promise<SkillRoadmapContent> {
  try {
    const { skill, proficiencyLevel, timeFrame, currentCourse, desiredRole } = params;

    const stageCount = mapTimeframeToStages(timeFrame);

    // concise system prompt: strict JSON-only schema and deterministic settings
    const systemPrompt = `You are CareerRoad AI. Return ONLY valid JSON that matches the schema exactly. No extra text.
Schema: {
  "skill": string,
  "proficiencyLevel": string,
  "timeFrame": string,
  "overview": string,
  "stages": [
    { "stage": string, "duration": string, "tasks": [string], "resources": [string] }
  ],
  "milestones": [string],
  "expectedOutcome": string
}
Provide ${stageCount} stages. Each stage: 3-5 tasks and 2-3 http(s) resource URLs (if possible). If you cannot provide URLs, provide empty strings in the resources array.`;

    const userPrompt = `Create ${stageCount} learning stages for skill "${skill}" for a user with proficiency "${proficiencyLevel}" in timeframe "${timeFrame}".
Context: current course="${currentCourse}", desired role="${desiredRole}".
Return ONLY the JSON defined above.`;

    const response = await retryWithBackoff((model) =>
      ai.models.generateContent({
        model,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.0,
          maxOutputTokens: 900,
        },
        contents: userPrompt,
      })
    );

    const rawJson = (response as any)?.text ?? (response as any)?.candidates?.[0]?.content?.[0]?.text ?? "";

    if (!rawJson || rawJson.trim().length === 0) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = parseJsonSafely(rawJson);

    const skillRoadmapSchema = z.object({
      skill: z.string(),
      proficiencyLevel: z.string(),
      timeFrame: z.string(),
      overview: z.string(),
      stages: z.array(
        z.object({
          stage: z.string(),
          duration: z.string(),
          tasks: z.array(z.string()),
          resources: z.array(z.string()),
        })
      ),
      milestones: z.array(z.string()),
      expectedOutcome: z.string(),
    });

    const validation = skillRoadmapSchema.safeParse(parsed);

    if (!validation.success) {
      console.error("Validation error:", validation.error);
      // Provide the raw snippet to help debugging
      const snippet = rawJson.substring(0, 2000);
      throw new Error(`Invalid skill roadmap structure from AI. Raw start: ${snippet}`);
    }

    return validation.data;
  } catch (error) {
    console.error("Failed to generate skill roadmap:", error);
    throw new Error(`Failed to generate skill roadmap: ${String(error)}`);
  }
}

function mapTimeframeToStages(timeFrame: string): number {
  switch (timeFrame) {
    case "24 hr":
    case "48 hr":
      return 2;
    case "3 days":
    case "1 week":
    case "2 weeks":
      return 3;
    case "4 weeks":
    case "3 months":
      return 4;
    case "6 months":
      return 5;
    default:
      return 3;
  }
}

export async function generateKanbanTasksFromRoadmap(roadmap: UserRoadmapHistory): Promise<KanbanTaskGeneration> {
  try {
    const isCareerRoadmap = roadmap.roadmapType === "career";

    // Lightweight summary only — reduces token usage and avoids overload
    let roadmapSummary: string;
    if (isCareerRoadmap && roadmap.phases) {
      roadmapSummary = roadmap.phases
        .map((phase, i) => `Phase ${i + 1}: ${phase.title} (${phase.duration_weeks} weeks)`)
        .join("\n");
    } else if (roadmap.skillContent?.stages) {
      roadmapSummary = roadmap.skillContent.stages
        .map((stage, i) => `Stage ${i + 1}: ${stage.stage} (${stage.duration})`)
        .join("\n");
    } else {
      roadmapSummary = `Learning path with multiple stages`;
    }

    const systemPrompt = `You are CareerRoad AI. Output ONLY valid JSON with shape:
{ "tasks": [ { "title": string, "description": string, "status": "todo", "position": number, "estimatedTime": string } ] }
Return 8-12 tasks. Keep titles <= 100 chars and descriptions <= 200 chars.`;

    const userMessage = isCareerRoadmap
      ? `Generate practical Kanban tasks for: ${roadmap.currentCourse} → ${roadmap.targetRole}\n\n${roadmapSummary}\n\nReturn JSON only.`
      : `Generate practical Kanban tasks for learning ${roadmap.skill} (${roadmap.proficiencyLevel}, ${roadmap.timeFrame})\n\n${roadmapSummary}\n\nReturn JSON only.`;

    const response = await retryWithBackoff((model) =>
      ai.models.generateContent({
        model,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.0,
          maxOutputTokens: 700,
        },
        contents: userMessage,
      })
    );

    const rawJson = (response as any)?.text ?? (response as any)?.candidates?.[0]?.content?.[0]?.text ?? "";

    if (!rawJson || rawJson.trim().length === 0) {
      throw new Error("Empty response from Gemini");
    }

    console.log("Kanban raw JSON length:", rawJson.length);

    const parsed = parseJsonSafely(rawJson);

    const validation = kanbanTaskGenerationSchema.safeParse(parsed);

    if (!validation.success) {
      console.error("Kanban generation validation error:", validation.error);
      const snippet = rawJson.substring(0, 2000);
      throw new Error(`Invalid Kanban task structure from AI. Raw start: ${snippet}`);
    }

    return validation.data;
  } catch (error) {
    console.error("Failed to generate Kanban tasks:", error);
    throw new Error(`Failed to generate Kanban tasks: ${String(error)}`);
  }
}