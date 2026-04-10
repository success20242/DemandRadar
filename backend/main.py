import { useEffect, useState } from "react";

export default function App() {
  const [insight, setInsight] = useState("");
  const [streamText, setStreamText] = useState("");
  const [spikes, setSpikes] = useState([]);
  const [chart, setChart] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/ws");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "AI_STREAM") {
        setStreamText((prev) => prev + data.token);
      }

      if (data.type === "TICKER") {
        setSpikes(data.spikes);
        setChart(data.chart);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div style={styles.bg}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1>📊 DemandRadar Terminal Pro</h1>
        <div style={styles.live}>● LIVE INTELLIGENCE FEED</div>
      </div>

      <div style={styles.grid}>

        {/* LEFT PANEL */}
        <div style={styles.panel}>
          <h2>🔥 AI LIVE REASONING (GROQ STREAM)</h2>
          <div style={styles.terminal}>
            {streamText || "Waiting for intelligence stream..."}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div style={styles.panel}>
          <h2>📈 MARKET TRENDS</h2>
          {chart.map((c, i) => (
            <div key={i} style={styles.row}>
              {c.query} → {c.count}
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.panel}>
          <h2>🚨 SPIKE ALERTS</h2>
          {spikes.map((s, i) => (
            <div key={i} style={styles.spike}>
              🔥 {s.query} ({s.ratio}x)
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  bg: {
    background: "#05070f",
    color: "#00ffcc",
    minHeight: "100vh",
    fontFamily: "monospace",
    padding: "20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #00ffcc",
    paddingBottom: "10px"
  },
  live: {
    color: "red",
    animation: "blink 1s infinite"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginTop: "20px"
  },
  panel: {
    border: "1px solid #00ffcc",
    padding: "10px",
    borderRadius: "5px"
  },
  terminal: {
    whiteSpace: "pre-wrap",
    fontSize: "14px",
    lineHeight: "1.5"
  },
  row: {
    padding: "5px 0",
    borderBottom: "1px solid #0f2a2a"
  },
  spike: {
    color: "#ff4d4d",
    fontWeight: "bold"
  }
};
