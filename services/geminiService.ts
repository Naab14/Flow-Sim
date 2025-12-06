import { GoogleGenAI, Type } from "@google/genai";
import { AppNode, AppEdge, SimulationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFlow = async (nodes: AppNode[], edges: AppEdge[]): Promise<SimulationResult> => {
  try {
    const model = "gemini-2.5-flash";

    const prompt = `
      You are a Lean Six Sigma Master Black Belt. Analyze the following manufacturing line structure (nodes and edges).
      
      Nodes represent process steps with Cycle Time (seconds), Defect Rate (%), and Batch Size.
      Edges represent the flow of material.

      Task:
      1. Identify the Bottleneck (the step with the longest cycle time).
      2. Calculate the Max Throughput (Units Per Hour) based on the bottleneck. Formula: 3600 / Bottleneck_Cycle_Time.
      3. Calculate Total Process Lead Time (sum of cycle times on the longest path).
      4. Estimate First Pass Yield (FPY) by multiplying (1 - defectRate) of all nodes in sequence.
      5. Provide 3 specific, actionable Lean improvements based on the data.
      
      Data:
      Nodes: ${JSON.stringify(nodes.map(n => ({ id: n.id, label: n.data.label, type: n.data.type, cycleTime: n.data.cycleTime, defectRate: n.data.defectRate })))}
      Edges: ${JSON.stringify(edges.map(e => ({ source: e.source, target: e.target })))}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert industrial engineer specializing in Lean Manufacturing and Six Sigma.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bottleneckNodeId: { type: Type.STRING, description: "ID of the bottleneck node. Return null if not applicable." },
            maxThroughput: { type: Type.NUMBER, description: "Calculated units per hour." },
            totalCycleTime: { type: Type.NUMBER, description: "Total time in seconds." },
            yield: { type: Type.NUMBER, description: "First Pass Yield as a percentage (0-100)." },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 improvement suggestions."
            },
            analysisText: { type: Type.STRING, description: "A brief executive summary of the analysis." }
          },
          required: ["bottleneckNodeId", "maxThroughput", "totalCycleTime", "yield", "suggestions", "analysisText"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as SimulationResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the flow. Please check your configuration and API key.");
  }
};
