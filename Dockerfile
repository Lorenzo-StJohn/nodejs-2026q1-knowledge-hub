# Stage 1 (build)

FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci -ignore-scripts

COPY . .
RUN npm run build

# Stage 2 (production)

FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev --ignore-scripts --no-fund --no-audit && \
    npm cache clean --force && \
    rm -rf /root/.npm /root/.cache /tmp/* && \
    find node_modules -type f \( -name "*.md" -o -name "*.map" -o -name "*.ts" -o -name "*.spec.*" \) -delete 2>/dev/null || true && \
    find node_modules -type d \( -name "test" -o -name "tests" -o -name "docs" -o -name "example" -o -name "examples" \) -exec rm -rf {} + 2>/dev/null || true && \
    rm -rf node_modules/.bin 2>/dev/null || true && \
    rm -rf dist/**/*.spec.js 2>/dev/null || true


ENV NODE_ENV=production
EXPOSE 4000
USER node

CMD ["npm", "run", "start:prod"]