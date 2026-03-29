import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ReviewResult {
  overallScore: number;
  categories: {
    title: string;
    score: number;
    suggestions: {
      original?: string;
      suggestion: string;
      reason: string;
    }[];
  }[];
  summary: string;
}

export async function reviewResume(resumeText: string, jobDescription: string): Promise<ReviewResult> {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `
    You are an expert Resume Reviewer and Career Coach. Your task is to analyse a resume against a job description and provide actionable feedback.
    
    CRITICAL GUIDELINES:
    1. Use Australian English spellings (e.g., analyse, personalised, organisation, programme).
    2. Apply the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
    3. Appeal to both non-technical recruiters (initial screening) and technical engineering managers (deep dive).
    4. Frame suggestions to accentuate how the candidate adds value to the organisation.
    5. Be specific. Highlight exactly what to change in a sentence.
    
    CATEGORIES TO REVIEW:
    - Objective/Summary
    - Job Description Alignment (Experience)
    - Side Projects
    - Formatting & Structure
    - Use of Language
    
    OUTPUT FORMAT:
    You must return a JSON object matching the ReviewResult interface.
  `;

  const prompt = `
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Analyse the resume above against the job description. Provide a score out of 100 and detailed suggestions for each category.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          categories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                score: { type: Type.NUMBER },
                suggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      suggestion: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ["suggestion", "reason"]
                  }
                }
              },
              required: ["title", "score", "suggestions"]
            }
          }
        },
        required: ["overallScore", "summary", "categories"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as ReviewResult;
}
