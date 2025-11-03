# 🏗️ Giai đoạn 1: Build NestJS
FROM node:20 AS builder

WORKDIR /app

# Sao chép file package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn và build
COPY . .
RUN npm run build

# 🚀 Giai đoạn 2: Chạy ứng dụng
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy kết quả build từ builder stage
COPY --from=builder /app/dist ./dist

# Mở cổng 3000 (NestJS mặc định)
EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["node", "dist/main"]
