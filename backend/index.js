const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const http = require("http");
const puppeteer = require("puppeteer");
require("dotenv").config();

const { Groq } = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// =========================
// 🤖 GROQ AI CLIENT
// =========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// =========================
// 📊 DATA ENGINE
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
// 🧠 REAL GROQ REASONING ENGINE
// =========================
async function generateAIInsight(data) {
  const top = data.top.map(t => t.query).join(", ");

  const prompt = `
You are a world-class financial + technology intelligence analyst.

Analyze these trending topics:
${top}

Return:
1. Why each topic is trending
2. Market / social / tech drivers
3. Economic impact
4. 7-day prediction

Keep it concise, executive intelligence style.
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("GROQ ERROR:", err.message);
    return "AI reasoning temporarily unavailable.";
  }
}

// =========================
// 🚨 SPIKE ENGINE
// =========================
function generateSpike() {
  const queries = [
    "AI Chatbots",
    "NFT Art",
    "Electric Cars",
    "Bitcoin Surge",
    "SpaceX",
    "Quantum Computing"
  ];

  const query = queries[Math.floor(Math.random() * queries.length)];

  return {
    query,
    ratio: (Math.random() * 5 + 1).toFixed(1),
    timestamp: new Date()
  };
}

// =========================
// 📡 API
// =========================
app.get("/trending", async (req, res) => {
  const insight = await generateAIInsight(trendingData);

  res.json({
    version: "enterprise-groq-v3",
    timestamp: new Date(),
    data: trendingData,
    insight
  });
});

// =========================
// 📄 PDF REPORT (PUPPETEER)
// =========================
app.get("/download-report", async (req, res) => {
  const insight = await generateAIInsight(trendingData);

  const html = `
  <html>
  <head>
    <title>Enterprise Intelligence Report</title>
    <style>
      body { font-family: Arial; padding: 40px; }
      h1 { color: #111827; }
      .box { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
    </style>
  </head>
  <body>
    <h1>📊 Enterprise Trend Intelligence Report</h1>
    <p><b>Date:</b> ${new Date().toISOString()}</p>

    <div class="box">
      <h2>🔥 Top Trends</h2>
      ${trendingData.top
        .map(t => `<p><b>${t.query}</b> — ${t.count}</p>`)
        .join("")}
    </div>

    <div class="box">
      <h2>🧠 Groq AI Insight</h2>
      <p>${insight}</p>
    </div>
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true
  });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=groq-report.pdf"
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
// 🔥 LIVE LOOP
// =========================
setInterval(async () => {
  const spike = generateSpike();
  const insight = await generateAIInsight(trendingData);

  broadcast({
    type: "LIVE_UPDATE",
    spikes: [spike],
    insight,
    chart: trendingData.top.map(t => ({
      name: t.query,
      value: t.count + Math.floor(Math.random() * 30)
    }))
  });

}, 8000);

// =========================
// 🚀 START SERVER
// =========================
server.listen(PORT, () => {
  console.log(`🚀 Groq Enterprise AI running on http://localhost:${PORT}`);
});
