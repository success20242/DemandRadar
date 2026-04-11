# =========================
# 🚀 STABLE ENTERPRISE BACKEND
# =========================

FROM node:18-bullseye

# Install system dependencies (IMPORTANT FIX)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip FIRST (critical fix)
RUN python3 -m pip install --upgrade pip

# Install Python package
RUN pip3 install pytrends

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

ENV PORT=5000

CMD ["node", "index.js"]
