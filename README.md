# PayMonth — BUNIVERS

Application de gestion de fiches de paie.

## Architecture

| Service       | Tech              | Port |
|---------------|-------------------|------|
| Frontend      | React             | 3000 |
| Backend API   | Node.js / Express | 3001 |
| PDF Service   | Node.js / PDFKit  | 3002 |
| Base de données | PostgreSQL      | 5432 |

## Prérequis

- Node.js 18+
- PostgreSQL 15+

## Lancer en local (sans Docker)

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

## TODO — Travail DevOps

> C'est ton boulot de stagiaire ! Rien ci-dessous n'est fait.

- [ ] Écrire les Dockerfiles pour chaque service
- [ ] Créer le docker-compose.yml pour l'environnement local
- [ ] Mettre en place la CI/CD avec GitHub Actions
- [ ] Déployer sur AWS EC2
