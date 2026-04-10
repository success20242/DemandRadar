import { useEffect, useState, useRef } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function App() {
  const [data, setData] = useState({
    top: [],
    categories: {},
    chart: [],
    wordcloud: ""
  });

  const [spikes, setSpikes] = useState([]);
  const [streamText, setStreamText] = useState("");

  const wsRef = useRef(null);

  // =========================
  // 🚀 INITIAL LOAD
  // =========================
  useEffect(() => {
    fetch("/trending") // 🔥 uses proxy
      .then(res => res.json())
      .then(res => {
        setData(res);
      });

    connectWS();
  }, []);

  // =========================
  // 🔌 WEBSOCKET ENGINE
  // =========================
  const connectWS = () => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      // 🔥 GROQ STREAM
      if (msg.type === "AI_STREAM") {
        setStreamText(prev => prev + msg.token);
      }

      // 📊 LIVE DATA
      setData(prev => ({
        ...prev,
        chart: msg.chart || prev.chart,
        wordcloud: msg.wordcloud || prev.wordcloud
      }));

      if (msg.spikes) setSpikes(msg.spikes);
    };

    ws.onclose = () => {
      setTimeout(connectWS, 2000);
    };
  };

  // =========================
  // 📊 CHARTS
  // =========================
  const chartData = {
    labels: data.chart.map(c => c._id || c.time),
    datasets: [
      {
        label: "Trend Volume",
        data: data.chart.map(c => c.count),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4
      }
    ]
  };

  const categoryData = {
    labels: Object.keys(data.categories),
    datasets: [
      {
        data: Object.values(data.categories),
        backgroundColor: ["#22c55e", "#3b82f6", "#f97316", "#a855f7"]
      }
    ]
  };

  // =========================
  // 📊 KPIs
  // =========================
  const totalTrends = data.top.length;
  const totalSpikes = spikes.length;

  // =========================
  // 📄 PDF
  // =========================
  const downloadPDF = () => {
    window.open("/download-report", "_blank");
  };

  return (
    <div style={styles.container}>

      {/* 🔴 LIVE HEADER */}
      <div style={styles.liveBar}>
        <span style={styles.liveDot}></span>
        DEMANDRADAR TERMINAL PRO — LIVE INTELLIGENCE
      </div>

      {/* KPI */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>📊 Trends: {totalTrends}</div>
        <div style={styles.kpiCard}>🔥 Spikes: {totalSpikes}</div>
      </div>

      <div style={styles.grid}>

        {/* LEFT PANEL */}
        <div style={styles.left}>

          {/* 🧠 GROQ TERMINAL */}
          <div style={styles.card}>
            <h2>🧠 LIVE AI REASONING</h2>
            <div style={styles.terminal}>
              {streamText || "Waiting for intelligence stream..."}
            </div>
          </div>

          {/* 📊 CHART */}
          <div style={styles.card}>
            <h2>📈 Trend Velocity</h2>
            <Line data={chartData} />
          </div>

          {/* 🌍 WORDCLOUD */}
          <div style={styles.card}>
            <h2>🌍 Word Intelligence</h2>
            {data.wordcloud && (
              <img
                src={data.wordcloud}
                style={styles.wordcloud}
              />
            )}
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div style={styles.right}>

          {/* SPIKES */}
          <div style={styles.card}>
            <h2>🚨 Spike Alerts</h2>
            {spikes.map((s, i) => (
              <div key={i} style={styles.spike}>
                🔥 {s.query} ({s.ratio}x)
              </div>
            ))}
          </div>

          {/* TOP */}
          <div style={styles.card}>
            <h2>📊 Top Trends</h2>
            {data.top.map((t, i) => (
              <div key={i}>{t.query}</div>
            ))}
          </div>

          {/* CATEGORY */}
          <div style={styles.card}>
            <h2>📂 Categories</h2>
            <Doughnut data={categoryData} />
          </div>

          {/* REPORT */}
          <div style={styles.card}>
            <button style={styles.button} onClick={downloadPDF}>
              📄 Download Intelligence Report
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// =========================
// 🎨 STYLES
// =========================
const styles = {
  container: {
    background: "#050b18",
    minHeight: "100vh",
    color: "#00ffcc",
    fontFamily: "monospace"
  },

  liveBar: {
    background: "#020617",
    padding: "10px",
    textAlign: "center",
    borderBottom: "1px solid #00ffcc"
  },

  liveDot: {
    width: "8px",
    height: "8px",
    background: "red",
    display: "inline-block",
    marginRight: "10px"
  },

  kpiRow: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px"
  },

  kpiCard: {
    background: "#0f172a",
    padding: "10px",
    borderRadius: "8px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "15px",
    padding: "15px"
  },

  left: { display: "flex", flexDirection: "column", gap: "15px" },
  right: { display: "flex", flexDirection: "column", gap: "15px" },

  card: {
    background: "#020617",
    padding: "15px",
    border: "1px solid #00ffcc",
    borderRadius: "10px"
  },

  terminal: {
    whiteSpace: "pre-wrap",
    fontSize: "13px",
    lineHeight: "1.5"
  },

  spike: {
    color: "#ff4d4d",
    fontWeight: "bold"
  },

  wordcloud: {
    width: "100%"
  },

  button: {
    background: "#00ffcc",
    padding: "10px",
    border: "none",
    cursor: "pointer"
  }
};
