FROM node:18-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY angular.json ./
COPY src ./src
RUN npm ci --silent
RUN npm run build -- --configuration production

FROM nginx:stable
COPY --from=builder /app/dist/room-reserve-frontend /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -rf /var/lib/apt/lists/*
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://localhost:80/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]