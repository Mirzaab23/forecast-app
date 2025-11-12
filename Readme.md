# Forecast Question Analyzer

A web application for structured, AI-powered forecasting of true/false questions (e.g., geopolitical or social events). Users receive a likelihood percentage, concise reasoning, and credible sources, powered by Google Gemini 2.5 Flash AI.

---

## Features

- Input true/false forecasting questions
- Receive likelihood percentage (0–100%)
- Get concise, 2–3 sentence reasoning
- References from credible sources
- Modern React + TypeScript frontend
- Bun runtime for fast server and API
- Easy deployment (Vercel-ready)

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Express, Bun, TypeScript
- **AI Model:** Google Gemini 2.5 Flash
- **Deployment:** Vercel (serverless API + static frontend)

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (for local dev)
- Node.js (for Vercel serverless API)
- Google Gemini API key

### Installation
```sh
bun install
```

### Running Locally
#### 1. Start the backend (Bun + Express):
```sh
bun run src/server/index.ts
```

#### 2. Start the frontend (Vite):
```sh
bun run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Usage
- Enter a true/false style question (e.g., "Will country X invade country Y in 2024?")
- Click **Analyze**
- View the AI's likelihood, reasoning, and sources

---

## API Reference
### POST `/api/forecast`
**Request:**
```json
{ "question": "Will X happen by Y?" }
```
**Response:**
```json
{
  "likelihood": 65,
  "analysis": "Reasoned summary...",
  "sources": ["https://credible.source1.com", ...]
}
```

---

## Deployment (Vercel)
- The project is Vercel-ready. See `vercel.json` for routing.
- API endpoints in `/api` are serverless functions.
- Static frontend is built with Vite.

---

## Environment Variables
Create a `.env` file in the project root:
```
GEMINI_KEY=your_google_gemini_api_key
PORT=4000
```

---

## Project Structure
```
forecast-app/
├── api/                # Vercel serverless API (for deployment)
│   └── forecast.ts
├── src/
│   ├── client/         # React frontend
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── style.css
│   └── server/         # Express backend (for local dev)
│       └── index.ts
├── index.html          # Main HTML entry
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json         # Vercel deployment config
└── ...
```

---

## License
MIT