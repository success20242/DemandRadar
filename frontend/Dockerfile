# Use a lightweight Node image for building frontend (if needed)
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy frontend source code
COPY . .

# Install dependencies (for React/Vue/Angular)
RUN npm install

# Build the static files into 'build' folder
RUN npm run build

# Stage 2: Use Nginx to serve the built static files
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
