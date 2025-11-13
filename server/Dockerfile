# 构建阶段
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# 生产阶段
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --legacy-peer-deps

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["npm", "run", "start:prod"]