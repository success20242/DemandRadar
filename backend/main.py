from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pymongo import MongoClient
from pytrends.request import TrendReq
import datetime, asyncio, os, pandas as pd, threading
from wordcloud import WordCloud
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

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

# =========================
# 🧠 AI INSIGHT ENGINE
# =========================
def generate_insight(trends):
    if not trends:
        return "No active trend movement detected."

    keywords = [t.get("query", "") for t in trends[:5]]

    text = " ".join(keywords).lower()

    if "ai" in text:
        return "AI adoption is accelerating across productivity and automation sectors."

    if "bitcoin" in text or "crypto" in text:
        return "Crypto sentiment is rising with renewed speculative interest."

    if "electric" in text or "car" in text:
        return "EV and green energy trends are gaining global momentum."

    return "Mixed global attention across tech, finance, and entertainment."

# =========================
# 🌐 TREND FUSION ENGINE
# =========================
def fetch_trends():
    try:
        df = pytrends.trending_searches(pn='united_states')
        google_trends = df[0].tolist() if not df.empty else []
    except:
        google_trends = ["ai chatbots", "electric cars", "nft art"]

    twitter_trends = ["ai tools", "tech layoffs", "bitcoin surge"]

    trends = list(set(google_trends + twitter_trends))

    now = datetime.datetime.utcnow()

    for q in trends:
        collection.update_one(
            {"query": q},
            {"$inc": {"count": 1}, "$set": {"category": "general"}},
            upsert=True
        )

        trend_history.insert_one({
            "query": q,
            "count": 1,
            "timestamp": now
        })

# =========================
# 📊 WORDCLOUD (ANIMATED READY)
# =========================
def generate_wordcloud():
    docs = list(collection.find())

    words = []
    for d in docs:
        words.extend(d.get("query", "").split())

    if not words:
        return

    wc = WordCloud(
        width=1000,
        height=500,
        background_color="black",
        colormap="plasma",
        max_words=80
    ).generate(" ".join(words))

    wc.to_file("static/wordcloud.png")

# =========================
# 📈 CHART DATA ENGINE (NEW FOR REACT)
# =========================
def get_chart_data():
    df = pd.DataFrame(list(trend_history.find()))

    if df.empty:
        return []

    df["timestamp"] = pd.to_datetime(df["timestamp"])

    grouped = df.groupby(df["timestamp"].dt.strftime("%H:%M"))["count"].sum().reset_index()

    return grouped.to_dict(orient="records")

# =========================
# 🚨 SPIKE DETECTOR
# =========================
def detect_spikes():
    df = pd.DataFrame(list(trend_history.find()))

    if df.empty:
        return []

    now = datetime.datetime.utcnow()
    recent = df[df['timestamp'] >= now - datetime.timedelta(minutes=10)]

    spikes = []

    for q in recent['query'].unique():
        qdf = df[df['query'] == q]

        if len(qdf) < 2:
            continue

        avg = qdf['count'].mean()
        latest = recent[recent['query'] == q]['count'].sum()

        if avg > 0 and latest / avg >= 2:
            spikes.append({
                "query": q,
                "ratio": round(latest / avg, 2),
                "velocity": latest
            })

    return spikes

# =========================
# 📡 WEBSOCKET SYSTEM (UPGRADED)
# =========================
async def broadcast(data):
    dead = []

    for ws in clients:
        try:
            await ws.send_json(data)
        except:
            dead.append(ws)

    for d in dead:
        clients.remove(d)

@app.websocket("/ws")
async def ws(ws: WebSocket):
    await ws.accept()
    clients.append(ws)

    try:
        while True:
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        clients.remove(ws)

# =========================
# 📊 API FOR REACT DASHBOARD (NEW STRUCTURED OUTPUT)
# =========================
@app.get("/trending")
def trending():
    top = list(collection.find().sort("count", -1).limit(10))

    cats = {}
    for d in collection.find():
        c = d.get("category", "other")
        cats[c] = cats.get(c, 0) + 1

    return {
        "top": top,
        "categories": cats,
        "chart": get_chart_data(),   # 📊 NEW
        "insight": generate_insight(top),
        "wordcloud": "/static/wordcloud.png?t=" + str(datetime.datetime.utcnow().timestamp())
    }

# =========================
# 📄 PDF REPORT
# =========================
def create_pdf(top, categories, insight):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)

    c.drawString(50, 750, "Global Trend Intelligence Report")
    c.drawString(50, 720, f"AI Insight: {insight}")

    y = 690
    c.drawString(50, y, "Top Trends:")

    y -= 20
    for t in top[:10]:
        c.drawString(60, y, f"{t['query']} ({t['count']})")
        y -= 15

    y -= 20
    c.drawString(50, y, "Categories:")

    y -= 20
    for k, v in categories.items():
        c.drawString(60, y, f"{k}: {v}")
        y -= 15

    c.save()
    buffer.seek(0)
    return buffer

@app.get("/download-report")
def download_report():
    top = list(collection.find().sort("count", -1).limit(10))

    cats = {}
    for d in collection.find():
        c = d.get("category", "other")
        cats[c] = cats.get(c, 0) + 1

    pdf = create_pdf(top, cats, generate_insight(top))

    return FileResponse(pdf, media_type="application/pdf", filename="report.pdf")

# =========================
# 🔁 REAL-TIME ENGINE LOOP
# =========================
async def loop():
    while True:
        fetch_trends()
        generate_wordcloud()

        payload = {
            "spikes": detect_spikes(),
            "chart": get_chart_data(),   # 📊 LIVE CHART FEED
            "insight": generate_insight(list(collection.find().sort("count", -1).limit(10))),
            "wordcloud": "/static/wordcloud.png?t=" + str(datetime.datetime.utcnow().timestamp())
        }

        await broadcast(payload)

        await asyncio.sleep(5)

threading.Thread(target=lambda: asyncio.run(loop()), daemon=True).start()
