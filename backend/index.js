const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");

const app = express();
const PORT = 5000;

// Dummy trending data
let trendingData = {
  top: [
    { query: "AI Chatbots", count: 120 },
    { query: "NFT Art", count: 95 },
    { query: "Electric Cars", count: 80 },
  ],
  categories: {
    Technology: 120,
    Finance: 90,
    Entertainment: 60,
  },
  wordcloud: "/static/wordcloud.png" // You can replace with a real image in frontend/public/static/
};

// Endpoint for frontend fetch
app.get("/trending", (req, res) => {
  res.json(trendingData);
});

// Create HTTP server for WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

// Simulate live spike alerts
function generateSpike() {
  const queries = ["AI Chatbots", "NFT Art", "Electric Cars", "SpaceX", "ReactJS"];
  const query = queries[Math.floor(Math.random() * queries.length)];
  const ratio = (Math.random() * 5 + 1).toFixed(1);

  return { query, ratio };
}

// Broadcast spikes every 10 seconds
setInterval(() => {
  const spike = generateSpike();
  const message = JSON.stringify([spike]);
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}, 10000);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
