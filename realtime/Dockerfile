FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY app.js ./app.js
ENV NODE_ENV=production WS_HOST=0.0.0.0 WS_PORT=22006
EXPOSE 22006
HEALTHCHECK --interval=20s --timeout=3s --retries=5 CMD wget -q --spider http://127.0.0.1:22006/health || exit 1
USER node
CMD ["npm", "start"]
