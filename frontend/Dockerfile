FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Pas de package-lock.json : npm install. Passer à `npm ci` dès qu'il est commité.
RUN npm install && npm cache clean --force

COPY public ./public
COPY src ./src

# CRA injecte REACT_APP_* au build : l'URL de l'API est figée dans le bundle.
# Elle est appelée depuis le navigateur, donc doit être joignable côté client.
ARG REACT_APP_API_URL=http://localhost:3001
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
