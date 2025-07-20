# --- Build Stage ---
FROM node:20-alpine AS build

WORKDIR /app
ENV NODE_ENV=development

# Cài dependencies (vite, recharts, ...)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source code
COPY . .

# Đảm bảo vite có quyền chạy (nếu cần)
RUN chmod +x node_modules/.bin/vite

# Build production
RUN npm run build

# --- Production Stage ---
FROM nginx:stable-alpine

# Copy build output vào nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy cấu hình nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
