import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const GEMINI_KEY = process.env.GEMINI_KEY;

if (!GEMINI_KEY) {
  console.error("❌ Missing GEMINI_KEY environment variable");
  process.exit(1);
}

app.use(express.json());

// Log requests
app.use((req, _res, next) => {
  console.log(`[SERVER] ${req.method} ${req.url}`);
  next();
});

app.post("/api/forecast", async (req, res) => {
  const { question } = req.body;
  console.log("[SERVER] Received question:", question);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            role: "system",
            parts: [
              {
                text: `
You are an expert geopolitical forecaster.
Respond ONLY in valid JSON (no markdown, no code fences).

Format:
{
  "likelihood": <integer 0-100>,
  "analysis": "<2-3 sentence reasoning>",
  "sources": ["https://credible.source1.com", "https://credible.source2.com"]
}
                `,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: `Forecast this true/false question: ${question}` }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
            topP: 0.8,
          },
        }),
      }
    );

    const data: any = await response.json();
    console.log("[SERVER] Gemini 2.5 raw response:", JSON.stringify(data, null, 2));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) {
      return res.json({
        likelihood: "N/A",
        analysis: `No visible response from Gemini (${data?.candidates?.[0]?.finishReason || "Unknown"})`,
        sources: [],
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (err) {
      parsed = { likelihood: "N/A", analysis: text, sources: [] };
    }

    return res.json(parsed);
  } catch (err: any) {
    console.error("[SERVER] Error calling Gemini 2.5 Flash:", err);
    return res.status(500).json({
      likelihood: "N/A",
      analysis: "Server error while calling Gemini",
      sources: [],
    });
  }
});


app.listen(PORT, () => {
  console.log(`[SERVER] Forecast API running on http://localhost:${PORT}`);
});
