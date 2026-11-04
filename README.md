# nestjs-redis-rbac
 
Auth and user management API.
 
**Stack:** NestJS, TypeScript (ESM), TypeORM, MySQL, Redis, JWT, Passport
 
## Features
 
- Custom Seeder
- JWT access + refresh tokens with rotation
- Multi-device sessions (`sessions` table), logout and logout-all
- Instant logout via Redis session revocation
- Login rate limiting (Redis)
- RBAC: roles (`SUPER_ADMIN`, `ADMIN`, `USER`) and permissions with dependencies
- Admin-only user creation, no public register
- User list with search, filters, sorting, pagination
- Suspend and restore (revokes all sessions)
- Safe delete (auto soft/force delete) and restore
- Resource classes for response shaping
## Requirements
 
- Node.js
- MySQL
- Redis
## Setup
 
```bash
yarn install
cp .env.example .env
yarn seed
yarn start:dev
```
 
`yarn seed` upserts permissions and creates the first `SUPER_ADMIN` from env vars.
 
## Environment
 
```
PORT=8000
JWT_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=
REDIS_HOST=localhost
REDIS_PORT=6379
```
 
Expiry values are in seconds. Add your database and seed credentials as well.
 
## API
 
Base path: `/api/v1`
 
| Area | Endpoints |
| --- | --- |
| Auth | login, refresh, logout, logout-all, profile |
| Users | list, create, update, suspend, restore, delete |
 