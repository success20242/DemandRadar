import { useEffect, useState } from "react";
import WorldViralMap from "./WorldViralMap";

export default function ViralWarRoom() {
  const [data, setData] = useState(null);
  const [feed, setFeed] = useState([]);
  const [status, setStatus] = useState("CONNECTING");

  // =========================
  // API LOAD
  // =========================
  useEffect(() => {
    fetch("http://localhost:5000/api/trends")
      .then(res => res.json())
      .then(res => {
        setData(res);
        setStatus("LIVE");
      })
      .catch(() => setStatus("OFFLINE"));

    connectWS();
  }, []);

  // =========================
  // WEBSOCKET STREAM
  // =========================
  const connectWS = () => {
    const ws = new WebSocket(`ws://${window.location.hostname}:5000/ws`);

    ws.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);

      if (parsed.type === "SATELLITE_FEED") {
        setData(prev => ({
          ...prev,
          heatmap: parsed.heatmap,
          top: parsed.predictions
        }));

        setFeed(prev => [parsed, ...prev].slice(0, 8));
      }
    };

    ws.onclose = () => {
      setTimeout(connectWS, 3000);
    };
  };

  // =========================
  // STATUS COLOR
  // =========================
  const getStatusColor = () => {
    if (status === "LIVE") return "#22c55e";
    if (status === "CONNECTING") return "#facc15";
    return "#ef4444";
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        🔴 VIRAL WAR ROOM — GLOBAL INTELLIGENCE COMMAND CENTER
      </div>

      {/* STATUS BAR */}
      <div style={styles.statusBar}>
        <span style={{ ...styles.dot, background: getStatusColor() }} />
        SYSTEM STATUS: {status}
      </div>

      <div style={styles.grid}>

        {/* LEFT: WORLD MAP */}
        <div style={styles.left}>
          <WorldViralMap data={data || {}} />
        </div>

        {/* RIGHT: INTELLIGENCE PANEL */}
        <div style={styles.right}>

          {/* LIVE FEED */}
          <div style={styles.card}>
            <h2>🛰️ Satellite Feed</h2>

            {feed.map((f, i) => (
              <div key={i} style={styles.feedItem}>
                🚀 Global Heat Update
                <br />
                🔥 Top: {f.predictions?.[0]?.query}
                <br />
                ⚡ Score: {f.predictions?.[0]?.score?.toFixed?.(2)}
              </div>
            ))}
          </div>

          {/* TOP VIRAL */}
          <div style={styles.card}>
            <h2>🔥 Top Viral Targets</h2>

            {(data?.top || []).slice(0, 6).map((t, i) => (
              <div key={i} style={styles.trend}>
                {t.prediction === "🚨 VIRAL IGNITION IMMINENT"
                  ? "🚨"
                  : "⚡"} {t.query}
              </div>
            ))}
          </div>

          {/* AI INSIGHT */}
          <div style={styles.card}>
            <h2>🧠 Viral Intelligence AI</h2>
            <p style={{ fontSize: "12px" }}>
              {data?.insight || "Analyzing global propagation signals..."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#050b18",
    minHeight: "100vh",
    color: "#00ffcc",
    fontFamily: "monospace"
  },

  header: {
    padding: "15px",
    textAlign: "center",
    fontSize: "18px",
    borderBottom: "1px solid #00ffcc"
  },

  statusBar: {
    padding: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid #0f172a"
  },

  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "10px",
    padding: "10px"
  },

  left: {},
  right: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  card: {
    background: "#020617",
    border: "1px solid #00ffcc",
    borderRadius: "10px",
    padding: "10px"
  },

  feedItem: {
    fontSize: "11px",
    marginBottom: "10px",
    paddingBottom: "5px",
    borderBottom: "1px solid #1e293b"
  },

  trend: {
    marginBottom: "6px"
  }
};
