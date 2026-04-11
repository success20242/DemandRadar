FROM node:18

# Install Python properly
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip (critical fix)
RUN pip3 install --no-cache-dir --upgrade pip setuptools wheel

# Install pytrends
RUN pip3 install --no-cache-dir pytrends

# Make python command available
RUN ln -sf python3 /usr/bin/python

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
ENV PORT=5000

CMD ["node", "index.js"]
