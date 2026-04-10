from pytrends.request import TrendReq
import json
import time
import random

pytrends = TrendReq(hl='en-US', tz=360)

KEYWORDS = [
    "AI Chatbots",
    "NFT Art",
    "Electric Cars",
    "Bitcoin",
    "SpaceX"
]

COUNTRIES = [
    "united_states",
    "united_kingdom",
    "nigeria",
    "india",
    "united_arab_emirates"
]

def fetch_trends():
    results = []

    for geo in COUNTRIES:
        try:
            pytrends.build_payload(KEYWORDS, timeframe='now 7-d', geo=geo)
            data = pytrends.interest_over_time()

            if data is None or data.empty:
                continue

            for keyword in KEYWORDS:
                if keyword in data.columns:
                    values = data[keyword].tolist()

                    if len(values) < 2:
                        continue

                    current = values[-1]
                    previous = values[-2] if values[-2] > 0 else 1

                    spike = round(current / max(previous, 1), 2)

                    results.append({
                        "query": keyword,
                        "country": geo,
                        "count": int(current),
                        "spike": spike
                    })

            time.sleep(random.uniform(2, 4))  # 🔥 safer delay

        except Exception:
            continue

    print(json.dumps(results))


if __name__ == "__main__":
    fetch_trends()
