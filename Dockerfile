# Stage 1 (build)

FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 (production)

FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev

ENV NODE_ENV=production
EXPOSE 4000
USER node

CMD ["npm", "run", "start:prod"]