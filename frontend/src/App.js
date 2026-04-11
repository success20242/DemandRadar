import { useEffect, useState, useRef } from "react";
import ViralWarRoom from "./components/ViralWarRoom";

export default function App() {
  const [viralData, setViralData] = useState(null);
  const wsRef = useRef(null);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetch("http://localhost:5000/api/trends")
      .then((res) => res.json())
      .then((data) => {
        console.log("🌍 VIRAL DATA LOADED:", data);
        setViralData(data);
      })
      .catch((err) => console.error("FETCH ERROR:", err));

    connectWS();

    // cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // =========================
  // WEBSOCKET VIRAL STREAM
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
              spikes: msg.spikes || prev?.spikes || [],
              chart: msg.chart || prev?.chart || []
            }));
          }
        } catch (err) {
          console.error("WS MESSAGE PARSE ERROR:", err);
        }
      }; // ✅ FIXED: properly closed function

      ws.onerror = (e) => {
        console.error("WS ERROR:", e);
      };

      ws.onclose = () => {
        console.log("🔁 WS RECONNECTING...");
        setTimeout(connectWS, 3000);
      };
    } catch (err) {
      console.error("WS CONNECTION FAILED:", err);
    }
  };

  // =========================
  // LOADING STATE
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
          fontFamily: "monospace"
        }}
      >
        🌍 Loading Viral Intelligence Command Center...
      </div>
    );
  }

  // =========================
  // MAIN WAR ROOM
  // =========================
  return <ViralWarRoom data={viralData} />;
}
