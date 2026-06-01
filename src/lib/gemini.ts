const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBCnZ-5fu27-girk8Y-7SChvc_CX6EfWXM";

export async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text.trim();
  } catch (error) {
    console.error("Gemini call failed:", error);
    throw error;
  }
}

// JSON parsing helper
export function extractJsonFromMarkdown(text: string): any {
  try {
    // Look for JSON block ```json ... ```
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonString.trim());
  } catch (e) {
    console.warn("Failed to parse JSON from response, trying regex match:", e);
    try {
      // Look for first '[' or '{' and last ']' or '}'
      const firstBracket = Math.min(
        text.indexOf("[") !== -1 ? text.indexOf("[") : Infinity,
        text.indexOf("{") !== -1 ? text.indexOf("{") : Infinity
      );
      const lastBracket = Math.max(text.lastIndexOf("]"), text.lastIndexOf("}"));
      if (firstBracket !== Infinity && lastBracket !== -1) {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      }
    } catch (err) {
      console.error("Manual bracket parsing failed too:", err);
    }
    return null;
  }
}
