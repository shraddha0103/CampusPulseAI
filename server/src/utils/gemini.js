import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export const analyzeIncident = async (description) => {
  try {
    const prompt = `
    Analyze this campus incident:

    "${description}"

    Return ONLY valid JSON.

    Format:
    {
      "category": "",
      "severity": "",
      "summary": ""
    }
    `;

    const result = await model.generateContent(prompt);

    const responseText = result.response.text();

    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedText);

  } catch (error) {

    console.log("Using local AI fallback...");

    // SMART LOCAL FALLBACK
    const text = description.toLowerCase();

    let category = "Other";
    let severity = "Medium";

    if (text.includes("water") || text.includes("leak")) {
      category = "Water";
      severity = "High";
    }

    else if (
      text.includes("spark") ||
      text.includes("electric") ||
      text.includes("smoke")
    ) {
      category = "Electrical";
      severity = "High";
    }

    else if (
      text.includes("garbage") ||
      text.includes("dirty")
    ) {
      category = "Cleanliness";
      severity = "Low";
    }

    return {
      category,
      severity,
      summary: "Generated using local AI fallback system",
    };
  }
};