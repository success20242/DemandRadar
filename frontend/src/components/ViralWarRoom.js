import WorldViralMap from "./WorldViralMap";

export default function ViralWarRoom({ data = {} }) {

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        🌍 VIRAL INTELLIGENCE WAR ROOM
      </div>

      {/* KPI */}
      <div style={styles.kpiRow}>
        <div style={styles.kpi}>📊 Trends: {data.top?.length || 0}</div>
        <div style={styles.kpi}>🚨 Spikes: {data.spikes?.length || 0}</div>
        <div style={styles.kpi}>🔥 Source: {data.source || "live"}</div>
      </div>

      <div style={styles.grid}>

        <div style={styles.panel}>
          <WorldViralMap data={data} />
        </div>

        <div style={styles.panel}>
          <h2>🚀 Viral Feed</h2>
          {(data.spikes || []).slice(0, 6).map((s, i) => (
            <div key={i} style={{ color: "#ff4d4d" }}>
              🔥 {s.query} — {s.ratio}x
            </div>
          ))}
        </div>

        <div style={styles.panel}>
          <h2>📊 Top Trends</h2>
          {(data.top || []).slice(0, 8).map((t, i) => (
            <div key={i}>🔹 {t.query}</div>
          ))}
        </div>

        <div style={styles.panel}>
          <h2>🧠 AI Insight</h2>
          <p style={{ fontSize: "12px" }}>
            {data.insight || "Analyzing global signals..."}
          </p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#050b18",
    color: "#00ffcc",
    minHeight: "100vh",
    fontFamily: "monospace",
    padding: "20px"
  },
  header: {
    textAlign: "center",
    fontSize: "22px",
    marginBottom: "15px",
    borderBottom: "1px solid #00ffcc",
    paddingBottom: "10px"
  },
  kpiRow: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "15px"
  },
  kpi: {
    padding: "10px",
    border: "1px solid #00ffcc"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "15px"
  },
  panel: {
    background: "#020617",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #00ffcc"
  }
};
