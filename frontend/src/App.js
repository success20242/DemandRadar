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
      .then(res => res.json())
      .then(data => {
        console.log("🌍 VIRAL DATA LOADED:", data);
        setViralData(data);
      })
      .catch(err => console.error("FETCH ERROR:", err));

    connectWS();
  }, []);

  // =========================
  // WEBSOCKET VIRAL STREAM
  // =========================
  const connectWS = () => {
    const ws = new WebSocket(`ws://${window.location.hostname}:5000/ws`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

     if (msg.type === "TICKER") {
  setViralData(prev => ({
    ...prev,
    spikes: msg.spikes || prev.spikes,
    chart: msg.chart || prev.chart
  }));
}

    ws.onerror = (e) => console.error("WS ERROR:", e);

    ws.onclose = () => {
      console.log("🔁 WS RECONNECTING...");
      setTimeout(connectWS, 3000);
    };
  };

  // =========================
  // LOADING STATE
  // =========================
  if (!viralData) {
    return (
      <div style={{
        color: "#00ffcc",
        background: "#050b18",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "monospace"
      }}>
        🌍 Loading Viral Intelligence Command Center...
      </div>
    );
  }

  // =========================
  // MAIN WAR ROOM
  // =========================
  return <ViralWarRoom data={viralData} />;
}
