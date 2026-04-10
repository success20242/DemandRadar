# =========================
# 🚀 ENTERPRISE NODE BACKEND
# =========================

FROM node:18-alpine

# 📁 Set working directory
WORKDIR /app

# 📦 Copy package files first (better caching)
COPY package*.json ./

# ⚡ Install dependencies
RUN npm install

# 📁 Copy source code
COPY . .

# 🌐 Expose backend port
EXPOSE 8000

# 🚀 Start production server
CMD ["node", "index.js"]
