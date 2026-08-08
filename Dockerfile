FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json ./
RUN npm install
COPY . .
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_RADAR_WS_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_RADAR_WS_URL=$NEXT_PUBLIC_RADAR_WS_URL
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat openssl wget
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY docker-entrypoint.sh /usr/local/bin/foresight-entrypoint
RUN chmod +x /usr/local/bin/foresight-entrypoint
EXPOSE 3000
ENTRYPOINT ["foresight-entrypoint"]
