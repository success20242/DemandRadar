import { useMemo } from "react";

export default function WorldViralMap({ data }) {

  const regions = useMemo(() => {
    const base = [
      "USA", "UK", "Nigeria", "UAE",
      "India", "Brazil", "Germany", "Japan"
    ];

    const spikes = data?.spikes || [];

    return base.map((country, i) => {
      const spike = spikes[i % spikes.length];
      return {
        country,
        heat: spike?.ratio || Math.random() * 2
      };
    });

  }, [data]);

  return (
    <div>
      <h2>🌍 Global Viral Heatmap</h2>

      <div style={styles.grid}>
        {regions.map((r, i) => (
          <div
            key={i}
            style={{
              ...styles.card,
              boxShadow: `0 0 ${r.heat * 10}px #00ffcc`
            }}
          >
            <h3>{r.country}</h3>
            <p>🔥 Heat: {r.heat.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px"
  },

  card: {
    background: "#020617",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #00ffcc"
  }
};
