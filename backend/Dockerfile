# =========================
# 🚀 ENTERPRISE NODE BACKEND (STABLE PYTHON VERSION)
# =========================

FROM node:18-bullseye

# Install Python + pip properly
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependency
RUN pip3 install pytrends --break-system-packages

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

ENV PORT=5000

CMD ["node", "index.js"]
