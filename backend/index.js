require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");
const puppeteer = require("puppeteer");
const { Groq } = require("groq-sdk");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("🌍 GLOBAL VIRAL HEATMAP SYSTEM ACTIVE");

// =========================
// AI CLIENT
// =========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// =========================
// COUNTRIES WE TRACK
// =========================
const COUNTRIES = ["UAE", "US", "UK", "NG", "IN"];

// =========================
// GLOBAL VIRAL DATA ENGINE
// =========================
function generateGlobalTrends() {
  const base = [
    "AI Agents",
    "Bitcoin Surge",
    "TikTok Monetization",
    "Tesla Robots",
    "Netflix Changes",
    "Apple Vision Pro",
    "Remote Work Boom",
    "Crypto Regulation"
  ];

  return base.map((trend) => {

    let countries = {};
    let total = 0;
    let topRegion = "US";
    let maxScore = 0;

    COUNTRIES.forEach((c) => {
      const velocity = Math.floor(Math.random() * 100);
      const boost = +(Math.random() * 3).toFixed(2);

      const score = Math.floor(velocity * boost);

      countries[c] = {
        velocity,
        score
      };

      total += score;

      if (score > maxScore) {
        maxScore = score;
        topRegion = c;
      }
    });

    const viralIndex = Math.floor(total / COUNTRIES.length);

    return {
      query: trend,
      globalScore: total,
      viralIndex,
      breakoutRegion: topRegion,
      countries
    };
  });
}

// =========================
// VIRAL RANKING
// =========================
function rankGlobal(trends) {
  return trends.sort((a, b) => b.globalScore - a.globalScore);
}

// =========================
// AI GLOBAL INSIGHT ENGINE
// =========================
async function generateAIInsight(trends) {
  const top = trends.slice(0, 5).map(t => t.query).join(", ");

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
You are a GLOBAL VIRAL INTELLIGENCE SYSTEM.

Analyze worldwide trends:

${top}

Return:
- Why they are trending globally
- Which regions are driving growth
- Which will go viral next (48–72h)
- Monetization opportunities per region
`
        }
      ],
      temperature: 0.8
    });

    return res.choices[0].message.content;

  } catch {
    return "AI unavailable";
  }
}

// =========================
// API ENDPOINT
// =========================
app.get("/api/trends", async (req, res) => {

  const trends = generateGlobalTrends();
  const ranked = rankGlobal(trends);

  const insight = await generateAIInsight(ranked);

  res.json({
    top: ranked,
    heatmap: ranked.map(t => ({
      query: t.query,
      globalScore: t.globalScore,
      breakoutRegion: t.breakoutRegion,
      countries: t.countries
    })),
    chart: ranked.map(t => ({
      _id: t.query,
      count: t.globalScore
    })),
    insight,
    source: "global-viral-heatmap"
  });
});

// =========================
// WEB SOCKET
// =========================
const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(data) {
  const msg = JSON.stringify(data);

  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(msg);
    }
  });
}

// =========================
// LIVE STREAM (SLOW + STABLE)
// =========================
setInterval(() => {

  const trends = rankGlobal(generateGlobalTrends());

  broadcast({
    type: "GLOBAL_HEATMAP",
    heatmap: trends.map(t => ({
      query: t.query,
      globalScore: t.globalScore,
      breakoutRegion: t.breakoutRegion
    }))
  });

}, 30000);

// =========================
// START
// =========================
server.listen(PORT, () => {
  console.log(`🚀 Global Heatmap running on http://localhost:${PORT}`);
});
