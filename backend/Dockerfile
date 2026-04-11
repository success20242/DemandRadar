# =========================
# 🚀 NODE + PYTHON BACKEND FIXED
# =========================

FROM node:18-alpine

# Install python + pip
RUN apk add --no-cache python3 py3-pip

# Make python command work
RUN ln -sf python3 /usr/bin/python

# Install python dependency
RUN pip3 install pytrends --break-system-packages

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
ENV PORT=5000

CMD ["node", "index.js"]
