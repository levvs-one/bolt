# Фронтенд страницы подписки собирается здесь же, а не заранее в CI.
FROM node:24.22-trixie-slim AS frontend-build
WORKDIR /opt/frontend

COPY subscription-page/frontend/package*.json subscription-page/frontend/.npmrc ./
RUN npm ci --no-audit --no-fund

COPY subscription-page/frontend/ .
RUN NODE_ENV=production npx vite build

FROM node:24.22-trixie-slim AS backend-build
WORKDIR /opt/app

COPY subscription-page/backend/package*.json subscription-page/backend/.npmrc ./
COPY subscription-page/backend/tsconfig.json ./
COPY subscription-page/backend/tsconfig.build.json ./

RUN npm ci --prefer-offline --no-audit --no-fund

COPY subscription-page/backend/ .

RUN npm run build \
    && npm run trace

FROM node:24.22-trixie-slim
WORKDIR /opt/app

LABEL org.opencontainers.image.title="Bolt Subscription Page"
LABEL org.opencontainers.image.description="Subscription page for the Bolt panel"
LABEL org.opencontainers.image.url="https://github.com/levvs-one/bolt"
LABEL org.opencontainers.image.source="https://github.com/levvs-one/bolt"
LABEL org.opencontainers.image.vendor="levvs-one"
LABEL org.opencontainers.image.licenses="AGPL-3.0"


RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=backend-build /opt/app/dist ./dist

COPY --from=frontend-build /opt/frontend/dist/ ./frontend/
COPY subscription-page/backend/ecosystem.config.js ./
COPY subscription-page/backend/docker-entrypoint.sh ./

ENV PM2_DISABLE_VERSION_CHECK=true
ENV NODE_OPTIONS="--max-old-space-size=16384"

RUN npm install pm2 -g \
&& rm -rf /usr/local/lib/node_modules/npm \
        /usr/local/lib/node_modules/corepack \
        /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
        /usr/local/include/node

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --start-interval=2s --retries=3 \
    CMD curl -fsS -o /dev/null --max-time 2 "http://127.0.0.1:${APP_PORT:-3010}/internal/health" || exit 1

ENTRYPOINT [ "/bin/sh", "docker-entrypoint.sh" ]

CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "production" ]
