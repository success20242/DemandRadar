from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from pytrends.request import TrendReq
import datetime, asyncio, os
import pandas as pd
from wordcloud import WordCloud

app = FastAPI()

if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

client = MongoClient("mongodb://mongodb:27017/")
db = client['trending_data']
collection = db['queries']
trend_history = db['trend_history']

pytrends = TrendReq()

clients = []

CATEGORIES = {
    'health': ['health','fitness','diet'],
    'education': ['school','course','exam'],
    'jobs': ['job','salary','career'],
    'products': ['buy','price','shop'],
    'services': ['service','repair','delivery']
}

def categorize(q):
    q = q.lower()
    for cat, words in CATEGORIES.items():
        if any(w in q for w in words):
            return cat
    return "other"

def fetch_trends():
    trends = pytrends.trending_searches(pn='united_states')[0].tolist()
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

def generate_wordcloud():
    text = " ".join([doc['query'] for doc in collection.find()])
    if text:
        wc = WordCloud(width=800, height=400).generate(text)
        wc.to_file("static/wordcloud.png")

def detect_spikes():
    df = pd.DataFrame(list(trend_history.find()))
    if df.empty:
        return []

    now = datetime.datetime.utcnow()
    last10 = df[df['timestamp'] >= now - pd.Timedelta(minutes=10)]

    spikes = []
    for q in last10['query'].unique():
        qdf = df[df['query']==q]
        avg = qdf['count'].mean()
        latest = last10[last10['query']==q]['count'].sum()

        if avg > 0 and latest/avg >= 2:
            spikes.append({
                "query": q,
                "latest": int(latest),
                "avg": round(avg,2),
                "ratio": round(latest/avg,2)
            })
    return spikes

async def broadcast(spikes):
    for ws in clients:
        await ws.send_json(spikes)

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    clients.append(ws)
    try:
        while True:
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        clients.remove(ws)

@app.get("/trending")
def trending():
    fetch_trends()
    generate_wordcloud()

    top = list(collection.find().sort("count",-1).limit(10))

    cats = {}
    for d in collection.find():
        c = d.get("category","other")
        cats[c] = cats.get(c,0)+1

    return {
        "top": top,
        "categories": cats,
        "wordcloud": "/static/wordcloud.png"
    }

async def loop():
    while True:
        fetch_trends()
        spikes = detect_spikes()
        if spikes:
            await broadcast(spikes)
        await asyncio.sleep(10)

import threading
threading.Thread(target=lambda: asyncio.run(loop()), daemon=True).start()
