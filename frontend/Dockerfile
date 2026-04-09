# Use Nginx to serve static files
FROM nginx:alpine

# Copy the compiled React build to Nginx's html folder
COPY build/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
