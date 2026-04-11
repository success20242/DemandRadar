# =========================
# 🚀 ENTERPRISE NODE BACKEND (PORT 5000 FIXED)
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

# 🌐 Expose backend port (UPDATED)
EXPOSE 5000

# 🌍 Set environment variable (IMPORTANT)
ENV PORT=5000

# 🚀 Start production server
CMD ["node", "index.js"]
