import React, { useState } from "react";

const App: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    console.log("[CLIENT] Sending question:", question);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      console.log("[CLIENT] Received:", data);
      setResult(data);
    } catch (err) {
      console.error("[CLIENT] Error:", err);
      setResult({ analysis: "Server error or connection issue." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Forecast Question Analyzer</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='Ask something like "Will country X invade country Y in 2024?"'
        />
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {result && (
        <div className="result">
          <h2>Likelihood: {result.likelihood ?? "N/A"}%</h2>
          <p>{result.analysis}</p>
          {result.sources?.length > 0 && (
            <>
              <h3>Sources</h3>
              <ul>
                {result.sources.map((src: string, i: number) => (
                  <li key={i}>
                    <a href={src} target="_blank" rel="noopener noreferrer">
                      {src}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
