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

async function retryWithBackoff<T>(
  fn: (model: string) => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
): Promise<T> {
  let lastError: Error;
  let currentModel = "gemini-2.5-flash";

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn(currentModel);
    } catch (error: any) {
      lastError = error;

      if ((error?.status === 503 || error?.status === 404) && i < maxRetries - 1) {
        if (currentModel === "gemini-2.5-flash" && (error?.status === 503 || error?.status === 404)) {
          console.log(`gemini-2.5-flash failed (${error?.status}), switching to gemini-2.5-pro...`);
          currentModel = "gemini-2.5-pro";
          continue;
        }

        const delay = initialDelay * Math.pow(2, i);
        console.log(
          `API request failed with ${error?.status}, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError!;
}

export async function generateRoadmap(
  currentCourse: string,
  targetRole: string,
): Promise<RoadmapPhase[]> {
  try {
    const systemPrompt = `You are a career guidance expert. Generate a detailed, structured career roadmap for a student.

Create a roadmap from "${currentCourse}" to "${targetRole}" with exactly 3 phases:
1. Foundation Phase (4-6 weeks)
2. Skill Building Phase (6-8 weeks) 
3. Career Preparation Phase (4-6 weeks)

For each phase, provide:
- A clear phase title
- Duration in weeks
- 4-6 specific actionable items

Each item should have:
- type: "resource", "tool", "task", or "community"
- label: Brief description (max 80 chars)
- description: Detailed explanation (max 150 chars)
- link: Optional URL for resources

Focus on practical, actionable steps that are specific to the Indian job market and include real companies, tools, and resources.

Respond with valid JSON in this exact format:
[
  {
    "title": "Phase Title",
    "duration_weeks": 5,
    "items": [
      {
        "type": "resource",
        "label": "Read specific book/course",
        "description": "Why this resource is important",
        "link": "https://example.com"
      }
    ]
  }
]`;

    const response = await retryWithBackoff((model) =>
      ai.models.generateContent({
        model: model,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
        contents: `Generate a career roadmap for a ${currentCourse} student to become a ${targetRole}. Include specific resources, tools, and actionable steps relevant to the Indian job market.`,
      }),
    );

    const rawJson = response.text;

    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const phases: RoadmapPhase[] = JSON.parse(rawJson);

    // Validate the structure
    if (!Array.isArray(phases) || phases.length === 0) {
      throw new Error("Invalid roadmap structure");
    }

    return phases;
  } catch (error) {
    console.error("Failed to generate roadmap:", error);
    throw new Error(`Failed to generate roadmap: ${error}`);
  }
}

export async function generateSkillRoadmap(
  params: GenerateSkillRoadmap,
): Promise<SkillRoadmapContent> {
  try {
    const { skill, proficiencyLevel, timeFrame, currentCourse, desiredRole } =
      params;

    const stageCount = mapTimeframeToStages(timeFrame);

    const systemPrompt = `You are CareerRoad AI, an expert mentor in career and skill development.

Generate a personalized, realistic skill-learning roadmap for the user based on their current proficiency and desired timeframe.

User details:
- Skill: ${skill}
- Current proficiency level: ${proficiencyLevel}
- Target timeframe: ${timeFrame}
${currentCourse ? `- Current course: ${currentCourse}` : ""}
${desiredRole ? `- Desired role: ${desiredRole}` : ""}

Create ${stageCount} learning stages that fit within the ${timeFrame} timeframe.

Stage mapping:
- ${stageCount} stages total
- Each stage should be a logical progression from ${proficiencyLevel}
- Tasks must be realistic and achievable within the allocated time
- Include India-relevant resources (Indian platforms, communities, companies)

Requirements:
1. Overview: Brief explanation of the skill and its relevance${desiredRole ? ` to ${desiredRole}` : ""}
2. Stages: ${stageCount} progressive stages (Beginner, Intermediate, Advanced, etc.)
   - Each stage has: stage name, duration, specific tasks array, resources array
3. Milestones: 3-5 checkpoints to track progress
4. Expected Outcome: What the user will achieve at the end

Focus on:
- Actionable, specific tasks sized appropriately for each stage duration
- Real tools, platforms, and resources (prefer free/freemium)
- Practical projects over theory
- Indian job market context

Respond with valid JSON matching this structure:
{
  "skill": "${skill}",
  "proficiencyLevel": "${proficiencyLevel}",
  "timeFrame": "${timeFrame}",
  "overview": "Brief skill overview and relevance",
  "stages": [
    {
      "stage": "Stage name (e.g., Beginner Fundamentals)",
      "duration": "Specific duration (e.g., 2 days, 1 week)",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "resources": ["https://example.com/resource1", "https://youtube.com/watch?v=example"]
    }
  ],
  "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
  "expectedOutcome": "What the user will be able to do"
}

IMPORTANT: The "resources" array MUST contain ONLY valid, complete URLs starting with http:// or https://. Do NOT use placeholder text or descriptions - only real, working URLs to actual resources like YouTube videos, documentation sites, tutorials, courses, etc.`;

    const userPrompt = `Generate a ${timeFrame} skill learning roadmap for ${skill}. The learner is at "${proficiencyLevel}" level${currentCourse ? ` and is currently studying ${currentCourse}` : ""}${desiredRole ? ` aiming to become a ${desiredRole}` : ""}.

Create ${stageCount} stages with practical tasks and resources. Ensure tasks are achievable within ${timeFrame}.

Required JSON keys: skill, proficiencyLevel, timeFrame, overview, stages (array with stage, duration, tasks array, resources array), milestones (array), expectedOutcome.`;

    const response = await retryWithBackoff((model) =>
      ai.models.generateContent({
        model: model,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
        contents: userPrompt,
      }),
    );

    const rawJson = response.text;

    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

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
        }),
      ),
      milestones: z.array(z.string()),
      expectedOutcome: z.string(),
    });

    const parsedData = JSON.parse(rawJson);
    const validation = skillRoadmapSchema.safeParse(parsedData);

    if (!validation.success) {
      console.error("Validation error:", validation.error);
      throw new Error("Invalid skill roadmap structure from AI");
    }

    return validation.data;
  } catch (error) {
    console.error("Failed to generate skill roadmap:", error);
    throw new Error(`Failed to generate skill roadmap: ${error}`);
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

// Helper function to extract key information from roadmap
function extractRoadmapEssentials(roadmap: UserRoadmapHistory): string {
  const isCareerRoadmap = roadmap.roadmapType === "career";

  if (isCareerRoadmap && roadmap.phases) {
    // Extract only titles and durations, limit to 3 phases
    const phasesSummary = roadmap.phases.slice(0, 3).map((phase, i) => 
      `${i + 1}. ${phase.title} (${phase.duration_weeks}w)`
    ).join('\n');

    return `Career Path: ${roadmap.currentCourse} → ${roadmap.targetRole}
Phases:
${phasesSummary}`;
  } else if (roadmap.skillContent?.stages) {
    // Extract only stage names and durations
    const stagesSummary = roadmap.skillContent.stages.map((stage, i) => 
      `${i + 1}. ${stage.stage} (${stage.duration})`
    ).join('\n');

    return `Skill: ${roadmap.skill}
Level: ${roadmap.proficiencyLevel}
Duration: ${roadmap.timeFrame}
Stages:
${stagesSummary}`;
  }

  return `Learning path with multiple stages`;
}

export async function generateKanbanTasksFromRoadmap(
  roadmap: UserRoadmapHistory,
): Promise<KanbanTaskGeneration> {
  try {
    const isCareerRoadmap = roadmap.roadmapType === "career";

    // Create concise roadmap summary - THIS IS THE KEY FIX
    const roadmapEssentials = extractRoadmapEssentials(roadmap);

    const systemPrompt = `You are a task planning expert. Generate 10-15 actionable Kanban tasks based on a learning roadmap.

STRICT OUTPUT FORMAT (JSON only):
{
  "tasks": [
    {
      "title": "Clear, actionable task name",
      "description": "Brief 1-2 sentence explanation",
      "status": "todo",
      "position": 0,
      "estimatedTime": "realistic duration (e.g., 2 days, 1 week)"
    }
  ]
}

RULES:
- Generate exactly 10-15 tasks
- All tasks MUST have status: "todo"
- Positions MUST be sequential: 0, 1, 2, 3... 
- Keep descriptions under 200 characters
- Make tasks specific and actionable
- Ensure proper JSON formatting`;

    const userMessage = `Create Kanban tasks for this learning path:

${roadmapEssentials}

Generate 10-15 practical, sequential tasks that break down the learning journey into manageable steps.`;

    const response = await retryWithBackoff((model) =>
      ai.models.generateContent({
        model: model,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          maxOutputTokens: 2048, // Limit response size
        },
        contents: userMessage,
      }),
    );

    const rawJson = response.text;

    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    // Log for debugging
    console.log("Kanban response length:", rawJson.length);

    let parsedData;
    try {
      parsedData = JSON.parse(rawJson);
    } catch (parseError) {
      console.error("JSON parse error. First 500 chars:", rawJson.substring(0, 500));
      throw new Error("Failed to parse Kanban tasks JSON");
    }

    const validation = kanbanTaskGenerationSchema.safeParse(parsedData);

    if (!validation.success) {
      console.error("Kanban validation error:", validation.error.errors);
      throw new Error("Invalid Kanban task structure from AI");
    }

    // Ensure tasks don't exceed 15
    const tasks = validation.data.tasks.slice(0, 15);

    return { tasks };
  } catch (error) {
    console.error("Failed to generate Kanban tasks:", error);
    throw new Error(`Failed to generate Kanban tasks: ${error}`);
  }
}