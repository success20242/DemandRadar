import { useEffect, useState, useRef } from "react";
import ViralWarRoom from "./components/ViralWarRoom";

export default function App() {
  const [viralData, setViralData] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);

  // =========================
  // INITIAL LOAD (API)
  // =========================
  useEffect(() => {
    loadInitialData();
    connectWS();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/trends");
      const data = await res.json();

      console.log("🌍 VIRAL DATA LOADED:", data);

      setViralData({
        top: data.top || [],
        spikes: data.spikes || [],
        chart: data.chart || [],
        insight: data.insight || "Waiting for AI insight..."
      });
    } catch (err) {
      console.error("FETCH ERROR:", err);

      // 🔥 fallback so UI never breaks
      setViralData({
        top: [],
        spikes: [],
        chart: [],
        insight: "Backend unavailable — running in offline mode"
      });
    }
  };

  // =========================
  // WEBSOCKET CONNECTION
  // =========================
  const connectWS = () => {
    try {
      const ws = new WebSocket(
        `ws://${window.location.hostname}:5000/ws`
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🔗 WebSocket connected");
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);

          if (msg.type === "TICKER") {
            setViralData((prev) => ({
              ...(prev || {}),
              spikes: msg.spikes || [],
              chart: msg.chart || [],
              top: prev?.top || [],
              insight: prev?.insight || "Live signal updating..."
            }));
          }
        } catch (err) {
          console.error("WS MESSAGE ERROR:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WS ERROR:", err);
      };

      ws.onclose = () => {
        console.log("🔁 WebSocket disconnected — reconnecting...");

        reconnectTimeout.current = setTimeout(() => {
          connectWS();
        }, 3000);
      };
    } catch (err) {
      console.error("WS CONNECTION FAILED:", err);
    }
  };

  // =========================
  // LOADING STATE (SAFE)
  // =========================
  if (!viralData) {
    return (
      <div
        style={{
          color: "#00ffcc",
          background: "#050b18",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "monospace",
          textAlign: "center",
          padding: "20px"
        }}
      >
        🌍 Initializing Viral Intelligence System...
        <br />
        Please wait
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return <ViralWarRoom data={viralData} />;
}
