import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GEMINI_KEY = process.env.GEMINI_KEY;

// Define the expected response type
interface ForecastResponse {
  likelihood: number | string;
  analysis: string;
  sources: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for web compatibility
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  // Validate input
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ 
      likelihood: 'N/A', 
      analysis: 'Please provide a valid question', 
      sources: [] 
    });
  }

  // Validate API key
  if (!GEMINI_KEY) {
    console.error('GEMINI_KEY environment variable is not set');
    return res.status(500).json({ 
      likelihood: 'N/A', 
      analysis: 'Server configuration error', 
      sources: [] 
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `You are a forecasting expert. Analyze true/false questions and respond with JSON format:
              {
                "likelihood": number (0-100),
                "analysis": "2-3 sentence reasoned analysis",
                "sources": ["url1", "url2", ...] or empty array if none
              }
              
              Guidelines:
              - Provide realistic probability estimates
              - Include credible sources when possible
              - Keep analysis concise and evidence-based
              - For geopolitical questions, consider current events and expert consensus`
            }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ 
                text: `Analyze this forecasting question and provide a likelihood percentage with reasoning: "${question.trim()}"` 
              }]
            }
          ],
          generationConfig: { 
            temperature: 0.4, 
            maxOutputTokens: 1024, 
            topP: 0.8 
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const data: any = await response.json();

    // Handle API errors from Gemini
    if (data.error) {
      console.error('Gemini API error:', data.error);
      return res.status(500).json({ 
        likelihood: 'N/A', 
        analysis: 'AI service error', 
        sources: [] 
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      return res.status(500).json({ 
        likelihood: 'N/A', 
        analysis: 'No response from AI service', 
        sources: [] 
      });
    }

    // Parse JSON response
    let parsed: ForecastResponse;
    try {
      const cleanedText = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleanedText);
      
      // Validate the parsed structure
      if (typeof parsed.likelihood === 'undefined' || !parsed.analysis) {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw text:', text);
      parsed = { 
        likelihood: 'N/A', 
        analysis: 'Failed to parse AI response. Raw: ' + text.substring(0, 200), 
        sources: [] 
      };
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      likelihood: 'N/A', 
      analysis: 'Server error while processing request', 
      sources: [] 
    });
  }
}