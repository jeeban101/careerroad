import { GoogleGenAI } from "@google/genai";
import { RoadmapPhase, SkillRoadmapContent, GenerateSkillRoadmap, kanbanTaskGenerationSchema, KanbanTaskGeneration, UserRoadmapHistory } from "@shared/schema";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateRoadmap(currentCourse: string, targetRole: string): Promise<RoadmapPhase[]> {
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
      contents: `Generate a career roadmap for a ${currentCourse} student to become a ${targetRole}. Include specific resources, tools, and actionable steps relevant to the Indian job market.`
    });

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

export async function generateSkillRoadmap(params: GenerateSkillRoadmap): Promise<SkillRoadmapContent> {
  try {
    const { skill, proficiencyLevel, timeFrame, currentCourse, desiredRole } = params;
    
    const stageCount = mapTimeframeToStages(timeFrame);
    
    const systemPrompt = `You are CareerRoad AI, an expert mentor in career and skill development.

Generate a personalized, realistic skill-learning roadmap for the user based on their current proficiency and desired timeframe.

User details:
- Skill: ${skill}
- Current proficiency level: ${proficiencyLevel}
- Target timeframe: ${timeFrame}
${currentCourse ? `- Current course: ${currentCourse}` : ''}
${desiredRole ? `- Desired role: ${desiredRole}` : ''}

Create ${stageCount} learning stages that fit within the ${timeFrame} timeframe.

Stage mapping:
- ${stageCount} stages total
- Each stage should be a logical progression from ${proficiencyLevel}
- Tasks must be realistic and achievable within the allocated time
- Include India-relevant resources (Indian platforms, communities, companies)

Requirements:
1. Overview: Brief explanation of the skill and its relevance${desiredRole ? ` to ${desiredRole}` : ''}
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
      "resources": ["Resource 1 with URL", "Resource 2"]
    }
  ],
  "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
  "expectedOutcome": "What the user will be able to do"
}`;

    const userPrompt = `Generate a ${timeFrame} skill learning roadmap for ${skill}. The learner is at "${proficiencyLevel}" level${currentCourse ? ` and is currently studying ${currentCourse}` : ''}${desiredRole ? ` aiming to become a ${desiredRole}` : ''}.

Create ${stageCount} stages with practical tasks and resources. Ensure tasks are achievable within ${timeFrame}.

Required JSON keys: skill, proficiencyLevel, timeFrame, overview, stages (array with stage, duration, tasks array, resources array), milestones (array), expectedOutcome.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
      contents: userPrompt
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const skillRoadmapSchema = z.object({
      skill: z.string(),
      proficiencyLevel: z.string(),
      timeFrame: z.string(),
      overview: z.string(),
      stages: z.array(z.object({
        stage: z.string(),
        duration: z.string(),
        tasks: z.array(z.string()),
        resources: z.array(z.string())
      })),
      milestones: z.array(z.string()),
      expectedOutcome: z.string()
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

export async function generateKanbanTasksFromRoadmap(roadmap: UserRoadmapHistory): Promise<KanbanTaskGeneration> {
  try {
    const isCareerRoadmap = roadmap.roadmapType === "career";
    const roadmapDescription = isCareerRoadmap
      ? `Career roadmap from ${roadmap.currentCourse} to ${roadmap.targetRole}`
      : `Skill roadmap for ${roadmap.skill} at ${roadmap.proficiencyLevel} proficiency level (${roadmap.timeFrame} timeframe)`;

    const systemPrompt = `You are a project management expert. Convert a learning roadmap into actionable Kanban board tasks.

Your goal is to transform roadmap phases and items into concrete, trackable tasks organized across three Kanban columns:
- "todo": Tasks to start with (early foundational items)
- "in_progress": Current focus tasks (intermediate items)
- "done": Prerequisites or quick wins that can be marked complete early

For each task:
- title: Clear, actionable task name (max 500 chars)
- description: Brief explanation of what to do and why
- status: Assign logically ("todo", "in_progress", or "done")
- position: Sequential number within each column (0, 1, 2...)
- resources: Array of links or resource names (optional)
- estimatedTime: Time estimate like "2-3 hours", "1 week" (optional)
- category: Phase name or skill area (optional)

Distribute tasks sensibly:
- todo column: 40-50% of tasks (foundational learning, setup)
- in_progress column: 30-40% of tasks (main skill building)
- done column: 10-20% of tasks (prerequisites, quick environment setup)

Output strict JSON matching this schema:
{
  "tasks": [{"title": string, "description": string, "status": "todo"|"in_progress"|"done", "position": number, "resources"?: string[], "estimatedTime"?: string, "category"?: string}],
  "boardSummary": "Brief board purpose" (optional)
}

No extra commentary. Pure JSON output only.`;

    const userMessage = isCareerRoadmap
      ? `${roadmapDescription}

Roadmap Phases:
${JSON.stringify(roadmap.phases, null, 2)}

Convert these phases into 12-20 actionable Kanban tasks distributed across todo, in_progress, and done columns.`
      : `${roadmapDescription}

Skill Content:
${JSON.stringify(roadmap.skillContent, null, 2)}

Convert this skill roadmap into 10-18 actionable Kanban tasks distributed across todo, in_progress, and done columns.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
      contents: userMessage
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const parsedData = JSON.parse(rawJson);
    const validation = kanbanTaskGenerationSchema.safeParse(parsedData);
    
    if (!validation.success) {
      console.error("Kanban generation validation error:", validation.error);
      throw new Error("Invalid Kanban task structure from AI");
    }

    return validation.data;
  } catch (error) {
    console.error("Failed to generate Kanban tasks:", error);
    throw new Error(`Failed to generate Kanban tasks: ${error}`);
  }
}