require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");
const { exec } = require("child_process");
const puppeteer = require("puppeteer");
const { Groq } = require("groq-sdk");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("🛰️ VIRAL PREDICTION SATELLITE SYSTEM ONLINE");

// =========================
// AI CLIENT
// =========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// =========================
// CACHE + SATELLITE MEMORY
// =========================
let lastGoodTrends = [];
let satelliteMemory = {};
let lastFetchTime = 0;
let isFetching = false;

const CACHE_TIME = 60000;

// =========================
// 🛰️ SATELLITE DATA ENGINE
// =========================
function processSatelliteData(trends) {
  const satellites = {
    NA: [],
    EU: [],
    ASIA: [],
    AFRICA: [],
    GLOBAL: []
  };

  trends.forEach(t => {
    const country = t.country || "GLOBAL";

    if (["USA", "Canada", "Mexico"].includes(country)) satellites.NA.push(t);
    else if (["UK", "Germany", "France"].includes(country)) satellites.EU.push(t);
    else if (["China", "India", "Japan"].includes(country)) satellites.ASIA.push(t);
    else if (["Nigeria", "Kenya", "South Africa"].includes(country)) satellites.AFRICA.push(t);
    else satellites.GLOBAL.push(t);
  });

  return satellites;
}

// =========================
// 🔥 VIRAL PREDICTION ENGINE (CORE)
// =========================
function predictVirality(trends) {
  return trends.map(t => {
    const momentum = (t.spike || 1) * (t.count || 1);

    const velocity =
      t.previousCount
        ? ((t.count - t.previousCount) / (t.previousCount || 1)) * 100
        : Math.random() * 40;

    const ignitionScore = (momentum * 0.6) + (velocity * 0.4);

    return {
      ...t,
      momentum,
      velocity,
      ignitionScore,
      prediction:
        ignitionScore > 150
          ? "🚨 VIRAL IGNITION IMMINENT"
          : ignitionScore > 80
          ? "⚠️ RISING MOMENTUM"
          : "🟢 STABLE"
    };
  });
}

// =========================
// PYTRENDS BRIDGE (SAFE)
// =========================
function getRealTrends(callback) {
  if (isFetching) return;

  const now = Date.now();

  if (now - lastFetchTime < CACHE_TIME && lastGoodTrends.length) {
    return callback(lastGoodTrends);
  }

  isFetching = true;

  const timeout = setTimeout(() => {
    console.log("⏰ SATELLITE TIMEOUT → fallback engaged");
    isFetching = false;
    fallback(callback);
  }, 20000);

  exec("python trendsEngine.py", (err, stdout) => {
    clearTimeout(timeout);
    isFetching = false;

    if (err) return fallback(callback);

    try {
      const data = JSON.parse(stdout);
      if (!data?.length) return fallback(callback);

      lastGoodTrends = data;
      lastFetchTime = now;

      callback(data);
    } catch {
      fallback(callback);
    }
  });
}

// =========================
// FALLBACK SYSTEM
// =========================
function fallback(callback) {
  const data = [
    { query: "AI Chatbots", count: 120, spike: 2.2, country: "USA" },
    { query: "Bitcoin Surge", count: 98, spike: 1.9, country: "UAE" },
    { query: "Electric Cars", count: 110, spike: 1.6, country: "Germany" },
    { query: "NFT Revival", count: 75, spike: 1.4, country: "UK" }
  ];

  callback(data);
}

// =========================
// 🌍 HEATMAP ENGINE
// =========================
function buildHeatmap(trends) {
  const map = {};

  trends.forEach(t => {
    const c = t.country || "GLOBAL";

    if (!map[c]) {
      map[c] = {
        country: c,
        score: 0,
        topics: []
      };
    }

    map[c].score += (t.spike || 1) * (t.count || 1);
    map[c].topics.push(t.query);
  });

  return Object.values(map);
}

// =========================
// 🧠 AI VIRAL SATELLITE ANALYSIS
// =========================
async function generateAIInsight(trends) {
  const top = trends.map(t => t.query).join(", ");

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `
You are a VIRAL SATELLITE INTELLIGENCE SYSTEM.

Analyze global trend signals:
${top}

Return:
- ignition signals
- next viral countries
- propagation paths
- 6-hour forecast
`
      }],
      temperature: 0.7
    });

    return res.choices[0].message.content;
  } catch {
    return "AI SATELLITE OFFLINE";
  }
}

// =========================
// API: SATELLITE COMMAND CENTER
// =========================
app.get("/api/trends", (req, res) => {

  getRealTrends(async (trends) => {

    const predicted = predictVirality(trends);
    const heatmap = buildHeatmap(predicted);
    const satellites = processSatelliteData(predicted);
    const insight = await generateAIInsight(predicted);

    const topViral = predicted.sort((a, b) => b.ignitionScore - a.ignitionScore);

    res.json({
      top: topViral,
      heatmap,
      satellites,
      chart: topViral.map(t => ({
        _id: t.query,
        count: t.count
      })),
      insight,
      system: "VIRAL_SATELLITE_V1"
    });
  });
});

// =========================
// WEBSOCKET (LIVE SATELLITE FEED)
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
// 🛰️ LIVE SATELLITE LOOP
// =========================
setInterval(() => {

  getRealTrends((trends) => {

    const predicted = predictVirality(trends);
    const heatmap = buildHeatmap(predicted);

    broadcast({
      type: "SATELLITE_FEED",
      heatmap,
      predictions: predicted.map(t => ({
        query: t.query,
        score: t.ignitionScore,
        status: t.prediction
      }))
    });

  });

}, 30000);

// =========================
// START SYSTEM
// =========================
server.listen(PORT, () => {
  console.log(`🛰️ SATELLITE SYSTEM RUNNING: http://localhost:${PORT}`);
});
