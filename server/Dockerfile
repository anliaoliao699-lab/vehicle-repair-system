FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY dist ./dist

EXPOSE 8080

CMD ["node", "dist/main.js"]