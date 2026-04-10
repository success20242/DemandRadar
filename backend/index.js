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

// =========================
// INIT
// =========================
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("🛰️ VIRAL PREDICTION SATELLITE SYSTEM ONLINE");
console.log("🛰️ SATELLITE SYSTEM RUNNING: http://localhost:" + PORT);

// =========================
// GROQ
// =========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// =========================
// CACHE SYSTEM
// =========================
let lastGoodTrends = [];
let cachedTrends = null;
let lastFetchTime = 0;
const CACHE_TIME = 60000;

// 🔥 LOCK (FIX OVERLAP)
let isFetching = false;

// =========================
// PYTRENDS ENGINE (HARDENED)
// =========================
function getRealTrends(callback, attempt = 1) {
  const MAX_ATTEMPTS = 3;

  // 🧠 CACHE CHECK FIRST
  const now = Date.now();
  if (cachedTrends && now - lastFetchTime < CACHE_TIME) {
    return callback(cachedTrends);
  }

  if (isFetching) return;

  isFetching = true;

  const timeout = setTimeout(() => {
    console.error("⏰ SATELLITE TIMEOUT");
    isFetching = false;
    fallbackData(callback);
  }, 20000);

  exec("python trendsEngine.py", (err, stdout) => {
    clearTimeout(timeout);
    isFetching = false;

    if (err) {
      console.error("PYTRENDS ERROR:", err.message);

      if (attempt < MAX_ATTEMPTS) {
        console.log("🔁 RETRYING SATELLITE...");
        return getRealTrends(callback, attempt + 1);
      }

      return fallbackData(callback);
    }

    try {
      const data = JSON.parse(stdout);

      if (!data || data.length === 0) {
        console.warn("⚠️ EMPTY SATELLITE DATA");
        return fallbackData(callback);
      }

      lastGoodTrends = data;
      cachedTrends = data;
      lastFetchTime = now;

      callback(data);

    } catch (e) {
      console.error("PARSE ERROR:", e.message);
      fallbackData(callback);
    }
  });
}

// =========================
// FALLBACK SYSTEM
// =========================
function fallbackData(callback) {
  console.log("🛟 Using fallback trend data");

  const fallback =
    lastGoodTrends.length > 0
      ? lastGoodTrends
      : [
          { query: "AI Chatbots", count: 90, spike: 1.3 },
          { query: "NFT Art", count: 70, spike: 1.2 },
          { query: "Bitcoin Surge", count: 110, spike: 1.7 },
          { query: "SpaceX", count: 95, spike: 1.4 }
        ];

  cachedTrends = fallback;
  callback(fallback);
}

// =========================
// SPIKE ENGINE
// =========================
function calculateSpikes(trends) {
  if (!Array.isArray(trends)) return [];

  return trends
    .filter(t => t?.spike >= 1.5)
    .map(t => ({
      query: t.query,
      ratio: t.spike,
      timestamp: new Date()
    }));
}

// =========================
// API
// =========================
app.get("/api/trends", (req, res) => {
  getRealTrends(async (trends) => {
    const spikes = calculateSpikes(trends);

    const insight = "Global viral signals active across AI, crypto, and space sectors.";

    res.json({
      top: trends,
      spikes,
      chart: trends.map(t => ({
        _id: t.query,
        count: t.count
      })),
      source: trends?.length ? "pytrends" : "fallback",
      insight
    });
  });
});

// =========================
// WS
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
// LIVE LOOP (SAFE 30s)
// =========================
setInterval(() => {

  if (isFetching) return;

  getRealTrends((trends) => {

    const spikes = calculateSpikes(trends);

    broadcast({
      type: "TICKER",
      spikes,
      chart: trends.map(t => ({
        query: t.query,
        count: t.count
      }))
    });

  });

}, 30000);

// =========================
// START
// =========================
server.listen(PORT, () => {
  console.log("🚀 SYSTEM ONLINE");
});
