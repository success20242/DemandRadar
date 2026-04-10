from pytrends.request import TrendReq
import json
import time

KEYWORDS = [
    "AI Chatbots",
    "NFT Art",
    "Electric Cars",
    "Bitcoin",
    "SpaceX"
]

COUNTRIES = ["united_states", "united_kingdom", "nigeria", "india", "united_arab_emirates"]

def fetch_trends():
    results = []

    for geo in COUNTRIES:
        try:
            pytrends = TrendReq(
                hl='en-US',
                tz=360,
                retries=2,
                backoff_factor=0.5
            )

            time.sleep(2)  # 🔥 IMPORTANT: prevents Google blocking

            pytrends.build_payload(KEYWORDS, timeframe='now 7-d', geo=geo)
            data = pytrends.interest_over_time()

            if data is None or data.empty:
                continue

            for keyword in KEYWORDS:
                if keyword in data.columns:
                    values = data[keyword].tolist()

                    current = values[-1]
                    previous = values[-2] if len(values) > 1 else 1

                    spike = round(current / max(previous, 1), 2)

                    results.append({
                        "query": keyword,
                        "country": geo,
                        "count": int(current),
                        "spike": spike
                    })

        except Exception as e:
            continue

    print(json.dumps(results))

if __name__ == "__main__":
    fetch_trends()
