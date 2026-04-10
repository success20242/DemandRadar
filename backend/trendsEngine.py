```python
from pytrends.request import TrendReq
import json

pytrends = TrendReq(hl='en-US', tz=360)

KEYWORDS = [
    "AI Chatbots",
    "NFT Art",
    "Electric Cars",
    "Bitcoin",
    "SpaceX",
    "Quantum Computing"
]

def fetch_trends():
    try:
        pytrends.build_payload(KEYWORDS[:5], timeframe='now 7-d')
        data = pytrends.interest_over_time()

        if data.empty:
            return []

        results = []

        for keyword in KEYWORDS[:5]:
            if keyword in data.columns:
                values = data[keyword].tolist()

                current = values[-1]
                previous = values[-2] if len(values) > 1 else 1

                spike = round(current / max(previous, 1), 2)

                results.append({
                    "query": keyword,
                    "count": int(current),
                    "spike": spike
                })

        print(json.dumps(results))

    except Exception as e:
        print(json.dumps([]))
```
