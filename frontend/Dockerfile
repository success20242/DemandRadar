# =========================
# 🧠 ENTERPRISE FRONTEND BUILD
# =========================

FROM nginx:alpine

# 📦 Copy build output
COPY build/ /usr/share/nginx/html

# ⚡ Replace default nginx config with enterprise version
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 🌐 Expose port
EXPOSE 80

# 🚀 Run Nginx
CMD ["nginx", "-g", "daemon off;"]
