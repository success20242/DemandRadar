import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

export default function WorldViralMap() {
  const [data, setData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    fetch("/api/trends")
      .then(res => res.json())
      .then(res => setData(res));

    const ws = new WebSocket(`ws://${window.location.hostname}:5000/ws`);

    ws.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);

      if (parsed.type === "GLOBAL_HEATMAP") {
        setData(prev => ({
          ...prev,
          heatmap: parsed.heatmap
        }));
      }
    };

    return () => ws.close();
  }, []);

  const getIntensity = (name) => {
    if (!data?.heatmap) return 0;

    const match = data.heatmap.find(t =>
      t.breakoutRegion === name || t.countries?.[name]
    );

    if (!match) return 0;

    return match.globalScore || 0;
  };

  const getColor = (val) => {
    if (val > 300) return "#ff0000";
    if (val > 200) return "#ff4d00";
    if (val > 100) return "#ff9900";
    if (val > 50) return "#ffd000";
    return "#1e3a8a";
  };

  return (
    <div style={{ display: "flex" }}>

      {/* 🌍 MAP */}
      <div style={{ width: "70%" }}>
        <ComposableMap>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name;
                const intensity = getIntensity(name);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => setSelectedCountry(name)}
                    style={{
                      default: {
                        fill: getColor(intensity),
                        outline: "none"
                      },
                      hover: {
                        fill: "#22c55e",
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "#06b6d4",
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* 📊 SIDE PANEL */}
      <div
        style={{
          width: "30%",
          padding: "20px",
          background: "#0f172a",
          color: "white"
        }}
      >
        <h2>🌍 Viral Intelligence</h2>

        {selectedCountry ? (
          <>
            <h3>{selectedCountry}</h3>
            <p>Live viral activity detected</p>
          </>
        ) : (
          <p>Click a country to view intelligence</p>
        )}

        <hr />

        <h3>🔥 Top Global Trends</h3>

        {data?.top?.slice(0, 5).map((t, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <b>{t.query}</b>
            <br />
            Score: {t.globalScore || t.count}
            <br />
            🚀 {t.breakoutRegion || "Global"}
          </div>
        ))}

        <hr />

        <h3>🧠 AI Insight</h3>
        <p style={{ fontSize: "12px" }}>
          {data?.insight || "Loading intelligence..."}
        </p>
      </div>
    </div>
  );
}
