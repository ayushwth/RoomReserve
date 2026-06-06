FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY angular.json ./
COPY src ./src
RUN npm ci --silent
RUN npm run build -- --configuration production

FROM nginx:stable-alpine
COPY --from=builder /app/dist/room-reserve-frontend /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]