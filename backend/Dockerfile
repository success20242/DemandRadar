# =========================
# 🚀 ENTERPRISE NODE BACKEND (WITH PYTHON SUPPORT)
# =========================

FROM node:18-alpine

# Install Python + pip
RUN apk add --no-cache python3 py3-pip

# Install Python dependency for trends engine
RUN pip3 install pytrends

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

ENV PORT=5000

CMD ["node", "index.js"]
