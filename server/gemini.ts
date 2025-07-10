import { GoogleGenAI } from "@google/genai";
import { RoadmapPhase } from "@shared/schema";

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