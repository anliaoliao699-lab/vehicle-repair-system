FROM node:18

WORKDIR /app

COPY package*.json ./

# 添加 --legacy-peer-deps 标志
RUN npm ci --omit=dev --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]