import { useEffect, useState } from "react";

function App() {
  const [data,setData] = useState({top:[],categories:{},wordcloud:""});
  const [spikes,setSpikes] = useState([]);

  useEffect(()=>{
    fetch("http://localhost:8000/trending")
      .then(res=>res.json())
      .then(setData);

    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (e)=>{
      setSpikes(JSON.parse(e.data));
    };

    return ()=>ws.close();
  },[]);

  return (
    <div style={{padding:"20px"}}>
      <h1>🌍 Global Trend Intelligence</h1>

      <h2>🔥 Live Spike Alerts</h2>
      {spikes.length>0 ? spikes.map((s,i)=>(
        <div key={i} style={{color:"red"}}>
          {s.query} (x{s.ratio})
        </div>
      )) : "No spikes yet"}

      <h2>Top Searches</h2>
      {data.top.map((t,i)=>(
        <div key={i}>{t.query} ({t.count})</div>
      ))}

      <h2>Categories</h2>
      {Object.entries(data.categories).map(([k,v])=>(
        <div key={k}>{k}: {v}</div>
      ))}

      <h2>Word Cloud</h2>
      <img src={"http://localhost:8000"+data.wordcloud} width="80%" />
    </div>
  );
}

export default App;
