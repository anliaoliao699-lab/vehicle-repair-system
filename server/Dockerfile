# 构建阶段
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

# 修复权限问题 - 确保 node_modules/.bin 中的所有文件都有执行权限
RUN chmod +x node_modules/.bin/* || true

# 强制清理旧的构建输出
RUN rm -rf dist || true

# 重新编译
RUN npm run build

# 生产阶段
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --legacy-peer-deps

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "run", "start:prod"]
