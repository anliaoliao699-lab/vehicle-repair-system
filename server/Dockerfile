
Copy

# 使用 Node.js 官方镜像
FROM node:16-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY . .

# 编译 TypeScript
RUN npm run build

# 暴露端口（微信云托管要求 8080）
EXPOSE 8080

# 启动应用
CMD ["node", "dist/main.js"]