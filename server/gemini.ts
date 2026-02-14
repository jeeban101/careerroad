import { GoogleGenAI } from "@google/genai";
import {
  RoadmapPhase,
  SkillRoadmapContent,
  GenerateSkillRoadmap,
  kanbanTaskGenerationSchema,
  KanbanTaskGeneration,
  UserRoadmapHistory,
  resumeAnalysisSchema,
} from "@shared/schema";
import type { ResumeAnalysis } from "@shared/schema";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: `Generate a career roadmap for a ${currentCourse} student to become a ${targetRole}. Include specific resources, tools, and actionable steps relevant to the Indian job market.`,
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
3. Milestones: 4-6 checkpoints to track progress
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
      "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"],
      "resources": ["Resource 1 with URL", "Resource 2"]
    }
  ],
  "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
  "expectedOutcome": "What the user will be able to do"
}`;

    const userPrompt = `Generate a ${timeFrame} skill learning roadmap for ${skill}. The learner is at "${proficiencyLevel}" level${currentCourse ? ` and is currently studying ${currentCourse}` : ""}${desiredRole ? ` aiming to become a ${desiredRole}` : ""}.

Create ${stageCount} stages with practical tasks and resources. Ensure tasks are achievable within ${timeFrame}.

Required JSON keys: skill, proficiencyLevel, timeFrame, overview, stages (array with stage, duration, tasks array, resources array), milestones (array), expectedOutcome.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: userPrompt,
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

export async function generateKanbanTasksFromRoadmap(
  roadmap: UserRoadmapHistory,
): Promise<KanbanTaskGeneration> {
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
        responseMimeType: "application/json",
      },
      contents: userMessage,
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

export async function analyzeResume(
  resumeText: string,
  options: { currentCourse?: string; desiredRole?: string } = {},
): Promise<ResumeAnalysis> {
  try {
    const { currentCourse, desiredRole } = options;

    const systemPrompt = `You are an elite career strategist and technical resume analyst with 15+ years of experience evaluating candidates at top-tier companies (FAANG, Big4, leading startups). Your analysis must be thorough, evidence-based, and actionable.

## YOUR ROLE
Perform a deep-dive analysis of the resume to extract skills, assess proficiency levels, and provide strategic, resume-specific feedback. Compare this resume against what you typically see from candidates at a similar career stage and target role. Highlight what makes THIS resume different — both positively and negatively.

## SKILL EXTRACTION RULES

### Skill Categories (use these exact values):
- "Programming Languages" - Java, Python, JavaScript, C++, Go, Rust, etc.
- "Frameworks & Libraries" - React, Angular, Django, Spring, TensorFlow, etc.
- "Databases" - PostgreSQL, MongoDB, Redis, Elasticsearch, etc.
- "Cloud & DevOps" - AWS, GCP, Azure, Docker, Kubernetes, CI/CD, etc.
- "Soft Skills" - Leadership, Communication, Problem Solving, etc.
- "Domain Knowledge" - Finance, Healthcare, E-commerce, AI/ML, etc.
- "Tools" - Git, Jira, Figma, Postman, etc.

### Proficiency Level Calibration (BE CONSERVATIVE):
- **Novice**: Mentioned but no projects/experience (e.g., "familiar with X")
- **Beginner**: Academic projects only OR < 6 months professional use
- **Intermediate**: 6 months - 2 years professional experience with demonstrable output
- **Advanced**: 2-5 years with significant ownership, mentoring others, or complex implementations
- **Expert**: 5+ years with architectural decisions, speaking/writing about it, or industry recognition

### Evidence Assessment:
For each skill, look for:
1. **Direct mentions** in skills section
2. **Project context** - what was built, scale, complexity
3. **Quantified achievements** - "improved X by Y%", "handled Z users"
4. **Certifications** - AWS Certified, Google Cloud, etc.
5. **Leadership signals** - "led team of X", "mentored Y engineers"
6. **Duration of exposure** - years of experience with the skill

### Confidence Score (0-1):
- 0.9-1.0: Skill explicitly stated with strong evidence (projects, metrics, certifications)
- 0.7-0.8: Clear evidence exists but some inference needed
- 0.5-0.6: Implied through related work or responsibilities
- 0.3-0.4: Weak signal, possibly transferable skills
- < 0.3: Highly speculative, minimal evidence

## ANALYSIS REQUIREMENTS

### Summary:
Write a compelling 2-3 sentence executive summary that captures:
- Current career stage (entry-level, mid-level, senior, lead, executive)
- Primary technical domain
- Most notable achievement or differentiator
- Overall career trajectory assessment

### Where it feels generic
List out 2-3 points where the resume feels generic, and ways to improve such

### Experience Calculation:
- Sum up professional experience (exclude internships unless < 2 years total)
- Account for overlapping roles
- Consider career gaps and context

### Role Detection: (2-3 roles)
- Identify the most likely current or target role
- Consider: job titles, responsibilities, skill distribution


### Strengths (EXACTLY 3 short phrases):
${desiredRole ? `Evaluate specifically for the ${desiredRole} role.` : ""}
- Each strength MUST be a short keyword phrase of 3-8 words max
- Each MUST reference something specific from THIS resume (a project, company, metric, technology, or achievement)
- Focus on what sets this candidate apart from others at the same level
- GOOD examples: "Strong React + TypeScript portfolio", "Led 5-person backend team", "3 deployed production ML models"
- BAD examples: "Good communication skills", "Strong problem-solving abilities", "Hands-on projects"

### Gaps (EXACTLY 3 short phrases):
${desiredRole ? `Critically analyze gaps specifically for the ${desiredRole} role.` : "Identify gaps for career progression."}
- Each gap MUST be a short keyword phrase of 3-8 words max
- Compare against what hiring managers expect for this role level
- Focus on the highest-impact missing skills or experiences
- GOOD examples: "No CI/CD or DevOps exposure", "Missing system design experience", "No cloud certifications"
- BAD examples: "The candidate could benefit from improving their knowledge of distributed systems"

### Recommendations (EXACTLY 3 short phrases):
${currentCourse ? `Consider the candidate is currently studying ${currentCourse}.` : ""}
${desiredRole ? `Tailor recommendations toward becoming a ${desiredRole}.` : ""}
- Each recommendation MUST be a short keyword phrase of 3-8 words max
- Prioritize the single highest-impact next step first
- Be hyper-specific: name the cert, course, or project type
- GOOD examples: "Get AWS Solutions Architect cert", "Build a distributed systems project", "Contribute to a CNCF project"
- BAD examples: "Consider pursuing cloud certifications to strengthen your profile"

## ANTI-GENERIC RULES (CRITICAL):
1. **Every single point in strengths, gaps, and recommendations MUST reference something specific** — a project name, company, technology, metric, or skill from THIS resume. Never use filler.
2. **Never use vague phrases** like "good fundamentals", "strong problem solver", "clear documentation", "hands-on projects", or "good communication skills" unless backed by DIRECT evidence from the resume.
3. **Compare against the market**: What would a typical candidate at this level have that this person doesn't? What does this person have that others don't?
4. **Be blunt and honest** — sugar-coating helps nobody. If the resume is weak, say so specifically.

## INDIAN JOB MARKET CONTEXT
- Factor in demand for skills in Indian tech hubs (Bangalore, Hyderabad, Pune, Chennai, NCR)
- Consider service companies vs product companies skill expectations
- Account for startup ecosystem requirements

## OUTPUT FORMAT

**IMPORTANT: Only include skills that are at "Advanced" or "Expert" level.** 
Do NOT include Novice, Beginner, or Intermediate skills in the output.

Return strict JSON matching this schema:
{
  "summary": string (2-3 sentences, highlight trajectory and standout qualities),
  "genericPoints": string[] (2-3 points where the resume feels generic, and ways to improve such),
  "totalExperienceYears": number (can be decimal like 2.5),
  "primaryRole": string (detected primary role),
  "skills": [
    {
      "name": string (specific skill name),
      "level": "Advanced"|"Expert" (ONLY these levels),
      "confidence": number (0-1),
      "years": number (estimated years),
      "keywords": string[] (related keywords from resume),
      "evidence": string (brief evidence supporting level),
      "category": string (one of the defined categories)
    }
  ],
  "strengths": string[] (EXACTLY 3 short keyword phrases, 3-8 words each),
  "gaps": string[] (EXACTLY 3 short keyword phrases, 3-8 words each),
  "recommendations": string[] (EXACTLY 3 short keyword phrases, 3-8 words each)
}

## CRITICAL RULES:
1. **ONLY return Advanced or Expert level skills** - skip all Novice, Beginner, and Intermediate skills
2. Never inflate skill levels - be conservative and evidence-based
3. Every skill needs strong evidence - 2+ years experience, complex projects, or certifications
4. If a candidate has no Advanced/Expert skills, return an empty skills array
5. **Strengths, gaps, and recommendations MUST be 3-8 word keyword phrases, NOT full sentences**
6. Sort skills by category first, then by confidence (highest first)
7. Return valid JSON only - no markdown, no comments, no extra text
8. **genericPoints MUST always be included** — each point should name the specific generic phrase/section from the resume and suggest a concrete improvement (e.g. "'Responsible for development' → quantify: 'Built X serving Y users'")`;

    const userPrompt = `Resume text:
${resumeText.slice(0, 15000)}

Analyze the above resume. Output JSON only.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(rawJson);
    const validated = resumeAnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      console.error("Resume analysis validation error:", validated.error);
      throw new Error("Invalid resume analysis structure from AI");
    }

    return validated.data;
  } catch (error) {
    console.error("Failed to analyze resume:", error);
    throw new Error(`Failed to analyze resume: ${error}`);
  }
}
