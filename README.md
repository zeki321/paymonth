# PayMonth — BUNIVERS

Application de gestion de fiches de paie.

## Architecture

| Service         | Tech              | Image finale  | Port (machine → conteneur) |
|-----------------|-------------------|---------------|----------------------------|
| Frontend        | React             | nginx:alpine  | 3000 → 80                  |
| Backend API     | Node.js / Express | node:20-alpine| 3001 → 3001                |
| PDF Service     | Node.js / PDFKit  | node:20-alpine| interne (3002)             |
| Base de données | PostgreSQL 16     | postgres:16-alpine | interne (5432)        |

Le navigateur appelle directement le backend (`REACT_APP_API_URL`). Le backend parle à
PostgreSQL et au PDF Service par le réseau interne de Docker Compose, via les noms de
service `db` et `pdf-service`.

## Lancer avec Docker (recommandé)

Prérequis : Docker avec le plugin Compose.

```bash
cp .env.example .env      # puis renseigner DB_PASSWORD
docker compose up --build
```

Application : http://localhost:3000 — API : http://localhost:3001/health

| Commande | Effet |
|----------|-------|
| `docker compose down` | Arrête et supprime les conteneurs, **conserve** les données |
| `docker compose down -v` | Supprime aussi les volumes (base de données et PDF) |
| `docker compose logs -f backend` | Suit les logs d'un service |
| `docker compose config` | Affiche le fichier final avec les variables résolues |

### Variables d'environnement (`.env`)

| Variable | Rôle |
|----------|------|
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Identifiants PostgreSQL, utilisés par `db` et `backend` |
| `FRONTEND_URL` | Origine autorisée par le CORS du backend |
| `REACT_APP_API_URL` | URL de l'API appelée par le navigateur, **figée dans le bundle au build** |

Notes :
- `.env` n'est pas versionné (il contient un secret). `.env.example` sert de modèle.
- `database/init.sql` n'est exécuté qu'au premier démarrage, quand le volume est vide.
  Pour le rejouer : `docker compose down -v`.
- Changer `REACT_APP_API_URL` demande de reconstruire l'image frontend (`--build`).

## Lancer en local (sans Docker)

Prérequis : Node.js 18+ et PostgreSQL 15+.

```bash
# 1. Base de données
psql -U postgres -c "CREATE DATABASE paymonth;"
psql -U postgres -d paymonth -f database/init.sql

# 2. Backend
cd backend && npm install && npm run dev

# 3. PDF Service
cd pdf-service && npm install && npm run dev

# 4. Frontend
cd frontend && npm install && npm start
```

## Tests

```bash
cd backend && npm install && npm test
```

## CI/CD

Le workflow `.github/workflows/ci.yml` se déclenche à chaque push sur `main` :

1. **test** : installe le backend et lance les tests Jest.
2. **build-and-push** (si `test` réussit) : construit les 3 images (backend, frontend,
   pdf-service) en parallèle et les publie sur GitHub Container Registry :
   `ghcr.io/<compte>/paymonth-<service>` avec les tags `latest` et `sha-<commit>`.

Pour le frontend, définir la variable de dépôt `REACT_APP_API_URL`
(Settings → Secrets and variables → Actions → Variables), sinon la valeur par défaut
`http://localhost:3001` est utilisée.

## TODO

- [x] Écrire les Dockerfiles pour chaque service
- [x] Créer le docker-compose.yml pour l'environnement local
- [x] Mettre en place la CI/CD avec GitHub Actions
- [ ] Lancer les tests sur les pull requests et protéger la branche `main`
- [ ] Commiter les `package-lock.json` et passer à `npm ci`
- [ ] Déployer sur AWS EC2
