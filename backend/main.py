from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from pytrends.request import TrendReq
import datetime, asyncio, os
import pandas as pd
from wordcloud import WordCloud
import threading

# --------------------------
# FastAPI setup
# --------------------------
app = FastAPI()

# Ensure static folder exists
if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

# --------------------------
# MongoDB setup
# --------------------------
client = MongoClient("mongodb://mongodb:27017/")
db = client['trending_data']
collection = db['queries']
trend_history = db['trend_history']

# --------------------------
# Pytrends setup
# --------------------------
pytrends = TrendReq()

# --------------------------
# WebSocket clients
# --------------------------
clients = []

# --------------------------
# Categories
# --------------------------
CATEGORIES = {
    'health': ['health', 'fitness', 'diet'],
    'education': ['school', 'course', 'exam'],
    'jobs': ['job', 'salary', 'career'],
    'products': ['buy', 'price', 'shop'],
    'services': ['service', 'repair', 'delivery']
}

def categorize(query: str) -> str:
    query = query.lower()
    for cat, words in CATEGORIES.items():
        if any(w in query for w in words):
            return cat
    return "other"

# --------------------------
# Fetch trends safely
# --------------------------
def fetch_trends():
    try:
        trends_df = pytrends.trending_searches(pn='united_states')
        if trends_df is not None and not trends_df.empty:
            trends = trends_df[0].tolist()
        else:
            trends = []
    except Exception as e:
        print("Pytrends fetch failed:", e)
        # fallback sample data
        trends = ["sample health tip", "new job openings", "buy smartphone", "online course", "repair service"]

    now = datetime.datetime.utcnow()

    for q in trends:
        cat = categorize(q)
        collection.update_one(
            {"query": q},
            {"$inc": {"count": 1}, "$set": {"category": cat}},
            upsert=True
        )
        trend_history.insert_one({
            "query": q,
            "count": 1,
            "timestamp": now
        })

# --------------------------
# Generate WordCloud
# --------------------------
def generate_wordcloud():
    text = " ".join([doc['query'] for doc in collection.find()])
    if text:
        wc = WordCloud(width=800, height=400).generate(text)
        wc.to_file("static/wordcloud.png")

# --------------------------
# Detect spikes
# --------------------------
def detect_spikes():
    df = pd.DataFrame(list(trend_history.find()))
    if df.empty:
        return []

    now = datetime.datetime.utcnow()
    last10 = df[df['timestamp'] >= now - pd.Timedelta(minutes=10)]

    spikes = []
    for q in last10['query'].unique():
        qdf = df[df['query'] == q]
        avg = qdf['count'].mean()
        latest = last10[last10['query'] == q]['count'].sum()
        if avg > 0 and latest / avg >= 2:
            spikes.append({
                "query": q,
                "latest": int(latest),
                "avg": round(avg, 2),
                "ratio": round(latest / avg, 2)
            })
    return spikes

# --------------------------
# Broadcast via WebSocket
# --------------------------
async def broadcast(spikes):
    for ws in clients:
        try:
            await ws.send_json(spikes)
        except Exception as e:
            print("WebSocket send error:", e)

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    clients.append(ws)
    try:
        while True:
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        clients.remove(ws)

# --------------------------
# API endpoint: /trending
# --------------------------
@app.get("/trending")
def trending():
    fetch_trends()
    generate_wordcloud()

    top = list(collection.find().sort("count", -1).limit(10))

    cats = {}
    for d in collection.find():
        c = d.get("category", "other")
        cats[c] = cats.get(c, 0) + 1

    return {
        "top": top,
        "categories": cats,
        "wordcloud": "/static/wordcloud.png"
    }

# --------------------------
# Async loop for continuous updates
# --------------------------
async def loop():
    while True:
        try:
            fetch_trends()
            spikes = detect_spikes()
            if spikes:
                await broadcast(spikes)
        except Exception as e:
            print("Error in loop:", e)
        await asyncio.sleep(10)

# Start async loop in daemon thread
threading.Thread(target=lambda: asyncio.run(loop()), daemon=True).start()
