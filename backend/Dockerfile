FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Pas de package-lock.json : npm install. Passer à `npm ci` dès qu'il est commité.
RUN npm install --omit=dev && npm cache clean --force

FROM node:20-alpine
ENV NODE_ENV=production \
    PORT=3001
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

# Exclure les tests de l'image
RUN rm -rf src/__tests__ && chown -R node:node /app
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

CMD ["node", "src/index.js"]
