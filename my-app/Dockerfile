# --- Build Stage ---
FROM node:20-alpine AS build
WORKDIR /app

ENV NODE_ENV=development

# Cài đặt dependencies (bao gồm devDependencies như vite)
COPY package*.json ./
RUN npm ci --include=dev

# Copy toàn bộ mã nguồn
COPY . .

# Đảm bảo vite có quyền thực thi
RUN chmod +x node_modules/.bin/vite

# Build app
RUN npm run build

# --- Production Stage ---
FROM nginx:stable-alpine

# Copy build output vào nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config nếu có
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
