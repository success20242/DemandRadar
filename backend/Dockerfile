# =========================
# 🚀 STABLE NODE + PYTHON + PYTRENDS FIX
# =========================

FROM node:18

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip (VERY IMPORTANT)
RUN pip3 install --upgrade pip setuptools wheel

# Install pytrends safely
RUN pip3 install pytrends

# Make python accessible
RUN ln -sf python3 /usr/bin/python

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
ENV PORT=5000

CMD ["node", "index.js"]
