# Site do servidor (servidor/compose.yaml): compila o React e entrega pelo Caddy, que também repassa /api e /hubs
FROM node:22-slim AS build
WORKDIR /site
COPY Checktruck.Web/package.json Checktruck.Web/package-lock.json ./
RUN npm ci
COPY Checktruck.Web/ ./
RUN npm run build

FROM caddy:2-alpine
COPY servidor/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /site/dist /srv
