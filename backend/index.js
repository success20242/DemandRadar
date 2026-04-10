const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const http = require("http");
const puppeteer = require("puppeteer");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// =========================
// 🤖 AI CLIENT (OPENAI / GROQ READY)
// =========================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// =========================
// 📊 DATA STATE
// =========================

let trendingData = {
  top: [
    { query: "AI Chatbots", count: 120 },
    { query: "NFT Art", count: 95 },
    { query: "Electric Cars", count: 80 }
  ],
  categories: {
    Technology: 120,
    Finance: 90,
    Entertainment: 60
  }
};

// =========================
// 🧠 REAL AI REASONING ENGINE
// =========================

async function generateAIInsight(data) {
  const top = data.top.map(t => t.query).join(", ");

  const prompt = `
You are a global market intelligence analyst.

Analyze these trending topics:
${top}

Return:
1. Why each topic is trending
2. What is driving public interest
3. Economic / tech / social impact
4. Future prediction (short term)

Keep it concise, professional, like Bloomberg intelligence.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("AI Error:", err.message);
    return "AI insight temporarily unavailable.";
  }
}

// =========================
// 🚨 SPIKE GENERATOR
// =========================

function generateSpike() {
  const queries = ["AI Chatbots", "NFT Art", "Electric Cars", "SpaceX", "Quantum Computing"];

  const query = queries[Math.floor(Math.random() * queries.length)];

  return {
    query,
    ratio: (Math.random() * 5 + 1).toFixed(1)
  };
}

// =========================
// 📡 API: TRENDING
// =========================

app.get("/trending", async (req, res) => {
  const insight = await generateAIInsight(trendingData);

  res.json({
    version: "enterprise-ai-1.0",
    timestamp: new Date(),
    data: trendingData,
    insight
  });
});

// =========================
// 📄 ENTERPRISE PDF REPORT (PUPPETEER)
// =========================

app.get("/download-report", async (req, res) => {
  const insight = await generateAIInsight(trendingData);

  const html = `
  <html>
  <head>
    <title>Trend Intelligence Report</title>
    <style>
      body { font-family: Arial; padding: 40px; }
      h1 { color: #111827; }
      .box { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
      .trend { font-weight: bold; }
    </style>
  </head>
  <body>

    <h1>📊 Enterprise Trend Intelligence Report</h1>
    <p><b>Date:</b> ${new Date()}</p>

    <div class="box">
      <h2>🔥 Top Trends</h2>
      ${trendingData.top
        .map(t => `<p class="trend">${t.query} — ${t.count}</p>`)
        .join("")}
    </div>

    <div class="box">
      <h2>🧠 AI Insight</h2>
      <p>${insight}</p>
    </div>

  </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();
  await page.setContent(html);

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true
  });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=trend-report.pdf"
  });

  res.send(pdf);
});

// =========================
// 🌐 WEBSOCKET ENGINE
// =========================

const server = http.createServer(app);
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
// 🔥 LIVE ENGINE LOOP
// =========================

setInterval(async () => {
  const spike = generateSpike();
  const insight = await generateAIInsight(trendingData);

  broadcast({
    type: "LIVE_UPDATE",
    spikes: [spike],
    insight,
    chart: trendingData.top.map(t => ({
      _id: t.query,
      count: t.count + Math.floor(Math.random() * 30)
    }))
  });

}, 10000);

// =========================
// 🚀 START
// =========================

server.listen(PORT, () => {
  console.log(`🚀 AI Enterprise Engine running on http://localhost:${PORT}`);
});
