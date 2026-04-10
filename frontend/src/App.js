import { useEffect, useState, useRef } from "react";
import {
  Line,
  Doughnut
} from "react-chartjs-2";

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

function App() {
  const [data, setData] = useState({
    top: [],
    categories: {},
    wordcloud: "",
    chart: []
  });

  const [spikes, setSpikes] = useState([]);
  const [insight, setInsight] = useState("");
  const [typed, setTyped] = useState("");

  const wsRef = useRef(null);

  // ========================
  // 🧠 TYPEWRITER (ENTERPRISE)
  // ========================
  useEffect(() => {
    let i = 0;
    const txt = insight || "";

    const interval = setInterval(() => {
      setTyped(txt.slice(0, i));
      i++;
      if (i > txt.length) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [insight]);

  // ========================
  // 📡 DATA ENGINE
  // ========================
  useEffect(() => {
    fetch("http://localhost:5000/trending")
      .then(res => res.json())
      .then(res => {
        setData(res);
        setInsight(res.insight || "");
      });

    const connectWS = () => {
      const ws = new WebSocket("ws://localhost:5000/ws");
      wsRef.current = ws;

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);

        setData(prev => ({
          ...prev,
          chart: msg.chart || prev.chart,
          wordcloud: msg.wordcloud || prev.wordcloud
        }));

        if (msg.spikes) setSpikes(msg.spikes);
        if (msg.insight) setInsight(msg.insight);
      };

      ws.onclose = () => {
        setTimeout(connectWS, 2000); // auto-reconnect
      };
    };

    connectWS();
  }, []);

  const downloadPDF = () => {
    window.open("http://localhost:5000/download-report", "_blank");
  };

  // ========================
  // 📊 CHART DATA (ENTERPRISE)
  // ========================
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

  // ========================
  // 📊 KPIs
  // ========================
  const totalTrends = data.top.length;
  const totalSpikes = spikes.length;
  const growthRate = data.chart.length
    ? ((data.chart[data.chart.length - 1]?.count || 0) / 10).toFixed(2)
    : 0;

  return (
    <div style={styles.container}>

      {/* 🔴 LIVE HEADER */}
      <div style={styles.liveBar}>
        <span style={styles.liveDot}></span>
        ENTERPRISE GLOBAL INTELLIGENCE DASHBOARD
      </div>

      {/* KPI ROW */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>📊 Trends: {totalTrends}</div>
        <div style={styles.kpiCard}>🔥 Spikes: {totalSpikes}</div>
        <div style={styles.kpiCard}>📈 Growth: {growthRate}%</div>
      </div>

      <h1 style={styles.title}>🌍 Global Trend Intelligence</h1>

      <div style={styles.grid}>

        {/* LEFT */}
        <div style={styles.left}>

          {/* WORD CLOUD */}
          <div style={styles.card}>
            <h2>🌍 Live Word Intelligence</h2>
            {data.wordcloud && (
              <img
                src={"http://localhost:5000" + data.wordcloud}
                style={styles.wordcloud}
              />
            )}
          </div>

          {/* LINE CHART */}
          <div style={styles.card}>
            <h2>📊 Trend Velocity</h2>
            <Line data={chartData} />
          </div>

          {/* CATEGORY CHART */}
          <div style={styles.card}>
            <h2>📂 Category Distribution</h2>
            <Doughnut data={categoryData} />
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>

          {/* SPIKES */}
          <div style={styles.card}>
            <h2>🚨 Spike Engine</h2>
            {spikes.map((s, i) => (
              <div key={i} style={styles.spike}>
                ⚡ {s.query} (x{s.ratio})
              </div>
            ))}
          </div>

          {/* TOP */}
          <div style={styles.card}>
            <h2>📊 Top Signals</h2>
            {data.top.map((t, i) => (
              <div key={i}>{t.query}</div>
            ))}
          </div>

          {/* AI INSIGHT */}
          <div style={styles.card}>
            <h2>🧠 AI Intelligence Layer</h2>
            <p style={styles.insight}>
              {typed}
              <span style={styles.cursor}>|</span>
            </p>
          </div>

          {/* REPORT */}
          <div style={styles.card}>
            <h2>📄 Export Engine</h2>
            <button style={styles.button} onClick={downloadPDF}>
              Generate Intelligence Report
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;

// ========================
// 🎨 ENTERPRISE STYLES
// ========================
const styles = {
  container: {
    background: "#050b18",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Arial"
  },

  liveBar: {
    background: "#0f172a",
    padding: "8px",
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: "2px"
  },

  liveDot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    background: "#22c55e",
    borderRadius: "50%",
    marginRight: "10px",
    animation: "pulse 1s infinite"
  },

  kpiRow: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px"
  },

  kpiCard: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    minWidth: "120px",
    textAlign: "center"
  },

  title: {
    textAlign: "center",
    margin: "10px"
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
    background: "#0f172a",
    padding: "15px",
    borderRadius: "12px"
  },

  wordcloud: {
    width: "100%",
    borderRadius: "10px"
  },

  spike: {
    color: "#f87171",
    fontWeight: "bold"
  },

  insight: {
    fontSize: "14px",
    lineHeight: "1.5"
  },

  cursor: {
    animation: "blink 1s infinite"
  },

  button: {
    background: "#22c55e",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};
