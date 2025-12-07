import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppNode, AppEdge, SimulationResult } from "../types";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

export const analyzeFlow = async (nodes: AppNode[], edges: AppEdge[]): Promise<SimulationResult> => {
  if (!API_KEY) {
    // Return mock analysis if no API key (for demo/testing)
    return getMockAnalysis(nodes, edges);
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

      Respond with ONLY valid JSON in this exact format:
      {
        "bottleneckNodeId": "node_id_here",
        "maxThroughput": 123,
        "totalCycleTime": 456,
        "yield": 95.5,
        "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
        "analysisText": "Brief executive summary here"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("No response from Gemini");

    // Parse JSON from response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON from response");

    return JSON.parse(jsonMatch[0]) as SimulationResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback to mock analysis on error
    return getMockAnalysis(nodes, edges);
  }
};

// Mock analysis for demo/testing without API key
function getMockAnalysis(nodes: AppNode[], edges: AppEdge[]): SimulationResult {
  // Find bottleneck (highest cycle time process node)
  const processNodes = nodes.filter(n => n.data.type === 'process' || n.data.type === 'quality');
  const bottleneck = processNodes.reduce((max, n) =>
    (n.data.cycleTime > (max?.data.cycleTime || 0)) ? n : max, processNodes[0]);

  const bottleneckCycleTime = bottleneck?.data.cycleTime || 10;
  const totalCycleTime = processNodes.reduce((sum, n) => sum + n.data.cycleTime, 0);

  // Calculate FPY
  const fpy = processNodes.reduce((yield_, n) =>
    yield_ * (1 - (n.data.defectRate || 0) / 100), 1) * 100;

  return {
    bottleneckNodeId: bottleneck?.id || null,
    maxThroughput: Math.round(3600 / bottleneckCycleTime),
    totalCycleTime,
    yield: Math.round(fpy * 10) / 10,
    suggestions: [
      `Consider adding parallel capacity at ${bottleneck?.data.label || 'bottleneck'} to increase throughput`,
      "Implement SMED (Single Minute Exchange of Dies) to reduce changeover times",
      "Add buffer inventory before the bottleneck to prevent starvation"
    ],
    analysisText: `The bottleneck is at ${bottleneck?.data.label || 'unknown'} with a cycle time of ${bottleneckCycleTime}s, limiting throughput to ${Math.round(3600 / bottleneckCycleTime)} units/hour. First Pass Yield is ${Math.round(fpy * 10) / 10}%.`
  };
}
