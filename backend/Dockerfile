# =========================
# 🚀 FINAL STABLE BACKEND (NODE + PYTHON VENV)
# =========================

FROM node:18

# Install Python + venv
RUN apt-get update && apt-get install -y \
    python3 \
    python3-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python3 -m venv /opt/venv

# Activate venv (IMPORTANT)
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip inside venv
RUN pip install --upgrade pip setuptools wheel

# Install pytrends inside venv
RUN pip install pytrends

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
ENV PORT=5000

CMD ["node", "index.js"]
