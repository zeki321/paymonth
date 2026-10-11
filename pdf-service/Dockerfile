FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Dépendances d'abord pour profiter du cache Docker
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY src ./src

# Le service écrit les PDF dans output/ : le dossier doit appartenir à node
RUN mkdir -p /app/output && chown -R node:node /app

# Exécution en utilisateur non-root (fourni par l'image node)
USER node

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

CMD ["node", "src/index.js"]
