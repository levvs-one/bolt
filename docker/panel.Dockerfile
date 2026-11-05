# Bolt собирает панель из своего исходника вместо готового архива фронтенда Remnawave.
FROM node:24.22-trixie-slim AS panel-build
WORKDIR /opt/panel

ARG SINGBOX_SCHEMA_URL=https://github.com/BlackDuty/sing-box-schema/releases/download/v1.13.13/schema.json
ARG MIHOMO_SCHEMA_URL=https://github.com/dongchengjie/meta-json-schema/releases/download/v1.19.29/meta-json-schema.json

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY panel/package*.json ./
RUN npm ci --no-audit --no-fund

COPY panel/ .
RUN NODE_ENV=production DOMAIN_OVERRIDE=0 npx vite build \
    && curl -fL https://validator.remna.dev/wasm_exec.js -o dist/assets/wasm_exec.js \
    && curl -fL https://validator.remna.dev/xray.schema.json -o dist/assets/xray.schema.json \
    && curl -fL https://validator.remna.dev/xray.schema.cn.json -o dist/assets/xray.schema.cn.json \
    && curl -fL ${SINGBOX_SCHEMA_URL} -o dist/assets/singbox.schema.json \
    && curl -fL ${MIHOMO_SCHEMA_URL} -o dist/assets/mihomo.schema.json \
    && curl -fL https://validator.remna.dev/main.wasm -o dist/assets/main.wasm

FROM node:24.22-trixie-slim AS backend-build
WORKDIR /opt/app

COPY backend/package*.json ./
COPY backend/patches ./patches
COPY backend/prisma ./prisma
COPY backend/rspack.config.mjs ./
COPY backend/prisma.config.ts ./prisma.config.ts
COPY backend/@types ./@types

RUN npm ci --prefer-offline --no-audit --no-fund

COPY backend/tsconfig*.json ./
COPY backend/src ./src
COPY backend/libs ./libs

RUN npm run migrate:generate \
    && npm run generate:openapi \
    && test -s openapi.json \
    && npm run build \
    && npm prune --omit=dev \
    && npm cache clean --force

RUN cd node_modules/@prisma/client/runtime && \
    find . -maxdepth 1 -type f ! -name 'library.js' ! -name 'package.json' -delete && \
    cd /opt/app/node_modules/.prisma/client && \
    find . -maxdepth 1 -type f \
      \( -name 'edge.*' -o -name 'index-browser.js' -o -name 'wasm.*' \
         -o -name 'query_engine_bg.*' -o -name '*-loader.mjs' \) -delete && \
    cd /opt/app && \
    rm -rf node_modules/typescript \
           node_modules/effect/dist/esm \
           node_modules/effect/dist/dts \
           node_modules/effect/src && \
    find node_modules \( -name '*.js.map' -o -name '*.mjs.map' \) -delete && \
    find node_modules \( -name '*.d.ts' -o -name '*.d.cts' -o -name '*.d.mts' \) -delete

FROM node:24.22-trixie-slim

LABEL org.opencontainers.image.title="Bolt"
LABEL org.opencontainers.image.description="Bolt panel, a Remnawave fork"
LABEL org.opencontainers.image.url="https://github.com/levvs-one/bolt"
LABEL org.opencontainers.image.source="https://github.com/levvs-one/bolt"
LABEL org.opencontainers.image.vendor="levvs-one"
LABEL org.opencontainers.image.licenses="AGPL-3.0"

WORKDIR /opt/app

ARG BRANCH=main
ARG __RW_METADATA_VERSION=1.1.1
ARG __RW_METADATA_GIT_BACKEND_COMMIT=0f344f388807f5323b49024a563b3f8146d66857
ARG __RW_METADATA_GIT_FRONTEND_COMMIT=0f344f388807f5323b49024a563b3f8146d66857
ARG __RW_METADATA_GIT_BRANCH=dev
ARG __RW_METADATA_BUILD_TIME=2011-11-11T11:11:11Z
ARG __RW_METADATA_BUILD_NUMBER=0

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

ENV REMNAWAVE_BRANCH=${BRANCH}
ENV PRISMA_HIDE_UPDATE_MESSAGE=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV PM2_DISABLE_VERSION_CHECK=true
ENV NODE_OPTIONS="--max-old-space-size=16384"
ENV __RW_METADATA_VERSION=${__RW_METADATA_VERSION}
ENV __RW_METADATA_GIT_BACKEND_COMMIT=${__RW_METADATA_GIT_BACKEND_COMMIT}
ENV __RW_METADATA_GIT_FRONTEND_COMMIT=${__RW_METADATA_GIT_FRONTEND_COMMIT}
ENV __RW_METADATA_GIT_BRANCH=${__RW_METADATA_GIT_BRANCH}
ENV __RW_METADATA_BUILD_TIME=${__RW_METADATA_BUILD_TIME}
ENV __RW_METADATA_BUILD_NUMBER=${__RW_METADATA_BUILD_NUMBER}

COPY --from=backend-build /opt/app/dist ./dist
COPY --from=backend-build /opt/app/openapi.json ./openapi.json
COPY --from=panel-build /opt/panel/dist ./frontend
COPY --from=backend-build /opt/app/prisma/generated ./prisma/generated
COPY --from=backend-build /opt/app/prisma/migrations ./prisma/migrations
COPY --from=backend-build /opt/app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=backend-build /opt/app/node_modules ./node_modules

COPY backend/configs /var/lib/remnawave/configs
COPY backend/package*.json ./
COPY backend/prisma.config.ts ./prisma.config.ts
COPY backend/ecosystem.config.js ./
COPY backend/docker-entrypoint.sh ./

RUN npm install -g pm2 \
    && chmod +x /opt/app/dist/cli.js \
    && ln -s /opt/app/dist/cli.js /usr/local/bin/cli \
    && rm -rf /usr/local/lib/node_modules/npm \
        /usr/local/lib/node_modules/corepack \
        /usr/local/bin/npm \
        /usr/local/bin/npx \
        /usr/local/bin/corepack \
        /usr/local/include/node

ENTRYPOINT [ "/bin/sh", "docker-entrypoint.sh" ]
CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "production" ]