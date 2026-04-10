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

console.log("🔥 DemandRadar LIVE ENGINE");
console.log("📁 Backend active:", __filename);

// =========================
// GROQ CLIENT
// =========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// =========================
// CACHE SYSTEM (IMPORTANT FIX)
// =========================
let lastGoodTrends = [];

// =========================
// PYTRENDS BRIDGE (HARDENED)
// =========================
function getRealTrends(callback, attempt = 1) {
  const MAX_ATTEMPTS = 3;

  const timeout = setTimeout(() => {
    console.error("⏰ PYTRENDS TIMEOUT");
    fallbackData(callback);
  }, 8000);

  exec("python trendsEngine.py", (err, stdout) => {
    clearTimeout(timeout);

    if (err) {
      console.error(`PYTRENDS ERROR (attempt ${attempt}):`, err.message);

      if (attempt < MAX_ATTEMPTS) {
        console.log("🔁 Retrying pytrends...");
        return getRealTrends(callback, attempt + 1);
      }

      return fallbackData(callback);
    }

    try {
      const data = JSON.parse(stdout);

      if (!data || data.length === 0) {
        console.warn("⚠️ Empty pytrends response");
        return fallbackData(callback);
      }

      lastGoodTrends = data;
      callback(data);

    } catch (e) {
      console.error("PARSE ERROR:", e.message);
      fallbackData(callback);
    }
  });
}

// =========================
// FALLBACK SYSTEM (CRITICAL SAFETY NET)
// =========================
function fallbackData(callback) {
  console.log("🛟 Using fallback trend data");

  const fallback =
    lastGoodTrends.length > 0
      ? lastGoodTrends
      : [
          { query: "AI Chatbots", count: 85, spike: 1.2 },
          { query: "NFT Art", count: 70, spike: 1.1 },
          { query: "Electric Cars", count: 95, spike: 1.3 },
          { query: "Bitcoin", count: 110, spike: 1.6 }
        ];

  callback(fallback);
}

// =========================
// SPIKE ENGINE (SAFE)
// =========================
function calculateSpikes(trends) {
  if (!Array.isArray(trends)) return [];

  return trends
    .filter(t => t && t.spike >= 1.5)
    .map(t => ({
      query: t.query,
      ratio: t.spike,
      timestamp: new Date()
    }))
    .sort((a, b) => b.ratio - a.ratio);
}

// =========================
// AI INSIGHT ENGINE
// =========================
async function generateAIInsight(trends) {
  const top = (trends || []).map(t => t.query).join(", ");

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
You are a global market intelligence analyst.

Analyze these trending topics:
${top}

Provide:
- Why each is trending
- Market drivers
- Economic impact
- 7-day prediction
`
        }
      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("GROQ ERROR:", err.message);
    return "AI temporarily unavailable";
  }
}

// =========================
// API ROUTE (HARDENED)
// =========================
app.get("/api/trends", (req, res) => {
  getRealTrends(async (trends) => {
    const safeTrends = trends || [];

    const spikes = calculateSpikes(safeTrends);
    const insight = await generateAIInsight(safeTrends);

    res.json({
      top: safeTrends,
      chart: safeTrends.map(t => ({
        _id: t.query,
        count: t.count
      })),
      spikes,
      categories: {
        Technology: 120,
        Finance: 90,
        Entertainment: 60
      },
      wordcloud: "/wordcloud.png",
      insight,
      source: trends?.length ? "pytrends" : "fallback"
    });
  });
});

// =========================
// PDF REPORT
// =========================
app.get("/download-report", async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  await page.setContent(`
    <html>
      <body style="font-family: Arial; padding: 40px;">
        <h1>DemandRadar Intelligence Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);

  const pdf = await page.pdf({ format: "A4" });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=report.pdf"
  });

  res.send(pdf);
});

// =========================
// WEBSOCKET ENGINE
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
// LIVE STREAM LOOP
// =========================
setInterval(() => {
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
}, 8000);

// =========================
// START SERVER
// =========================
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
