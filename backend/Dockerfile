# =========================
# 🚀 STABLE NODE + PYTHON BACKEND
# =========================

FROM node:18

# Install python + pip properly (Debian-based)
RUN apt-get update && apt-get install -y python3 python3-pip

# Make python command work
RUN ln -sf python3 /usr/bin/python

# Install python dependency
RUN pip3 install pytrends

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
ENV PORT=5000

CMD ["node", "index.js"]
