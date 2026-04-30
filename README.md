# HireHub

A scalable, microservices-based job board platform built with Hono, Prisma, and PostgreSQL — orchestrated as a Turborepo monorepo.

Companies can post job listings, candidates can apply, and the platform handles everything from authentication to real-time notifications across independently deployable services.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Services](#services)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Gateway](#api-gateway)
- [Shared Packages](#shared-packages)
- [Docker](#docker)
- [Contributing](#contributing)

---

## Architecture Overview

HireHub follows a **microservices architecture** where each service is independently responsible for a single business domain. Services communicate with each other via HTTP (through the API Gateway) and asynchronously via a message broker (Redis Pub/Sub) for event-driven flows like notifications.

```
Client
  │
  ▼
API Gateway (Hono)          ← Single entry point
  │
  ├──▶ Auth Service          ← JWT issuing & verification
  ├──▶ User Service          ← Candidate & company profiles
  ├──▶ Job Service           ← Job listings CRUD & search
  ├──▶ Application Service   ← Job applications & status
  └──▶ Notification Service  ← Email notifications (event-driven)
          ▲
          │
       Redis Pub/Sub         ← Async inter-service messaging
```

Each service has its own:

- Hono HTTP server
- Prisma schema
- PostgreSQL database
- `.env` configuration

---

## Tech Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| HTTP Framework   | [Hono](https://hono.dev)         |
| ORM              | [Prisma](https://www.prisma.io)  |
| Database         | PostgreSQL                       |
| Language         | TypeScript                       |
| Monorepo         | [Turborepo](https://turbo.build) |
| Messaging        | Redis Pub/Sub                    |
| Containerization | Docker + Docker Compose          |
| Auth             | JWT (JSON Web Tokens)            |

---

## Project Structure

```
hirehub/
├── apps/
│   ├── gateway/                  # API Gateway — routes requests to services
│   ├── auth-service/             # Handles register, login, JWT
│   ├── user-service/             # Candidate and company profiles
│   ├── job-service/              # Job listings, search, filters
│   ├── application-service/      # Applications and status tracking
│   ├── notification-service/     # Email notifications via events
│   └── web/                      # Frontend (coming soon)
│
├── packages/
│   └── types/                    # Shared TypeScript interfaces & types
│
├── docker-compose.yml            # Runs all services + databases locally
├── turbo.json                    # Turborepo pipeline config
├── package.json                  # Monorepo root with workspaces
└── .gitignore
```

---

## Services

### 🔐 Auth Service

**Port:** `4001`

Handles all authentication logic. Issues signed JWTs on login and exposes a `/verify` endpoint used by the gateway to authenticate incoming requests.

**Endpoints:**
| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/auth/verify` | Verify a JWT token |

---

### 👤 User Service

**Port:** `4002`

Manages candidate and company profiles. Candidates can update their resume/bio, companies can manage their organization info.

**Endpoints:**
| Method | Route | Description |
|---|---|---|
| GET | `/users/:id` | Get user profile |
| PUT | `/users/:id` | Update user profile |
| GET | `/users/:id/company` | Get company profile |

---

### 💼 Job Service

**Port:** `4003`

Core service for job listings. Companies can create, update, and close listings. Candidates can browse and search with filters.

**Endpoints:**
| Method | Route | Description |
|---|---|---|
| GET | `/jobs` | List all open jobs (with filters) |
| GET | `/jobs/:id` | Get a single job listing |
| POST | `/jobs` | Create a job listing (company only) |
| PUT | `/jobs/:id` | Update a job listing |
| DELETE | `/jobs/:id` | Close/delete a listing |

---

### 📋 Application Service

**Port:** `4004`

Handles candidates applying to jobs and tracks application status through the hiring pipeline.

**Endpoints:**
| Method | Route | Description |
|---|---|---|
| POST | `/applications` | Apply to a job |
| GET | `/applications/:id` | Get application details |
| GET | `/applications/user/:userId` | All applications by a candidate |
| PUT | `/applications/:id/status` | Update status (company only) |

---

### 🔔 Notification Service

**Port:** `4005`

Listens to events published by other services via Redis and sends email notifications. Does not expose public HTTP endpoints — purely event-driven.

**Listens to events:**
| Event | Trigger |
|---|---|
| `application.created` | Candidate applied to a job |
| `application.status_changed` | Company updated application status |
| `job.created` | New job posted |

---

### 🌐 API Gateway

**Port:** `4000`

The single entry point for all client requests. Verifies JWTs by calling the Auth Service, then proxies the request to the appropriate downstream service.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org) v18+
- [npm](https://npmjs.com) v9+
- [Docker](https://docker.com) & Docker Compose
- [Git](https://git-scm.com)

### Clone the repo

```bash
git clone https://github.com/yourusername/hirehub.git
cd hirehub
```

### Install dependencies

```bash
npm install
```

This installs dependencies for all services and packages via npm workspaces.

---

## Environment Variables

Each service has its own `.env` file. Copy the example files and fill in your values:

```bash
cp apps/auth-service/.env.example apps/auth-service/.env
cp apps/user-service/.env.example apps/user-service/.env
cp apps/job-service/.env.example apps/job-service/.env
cp apps/application-service/.env.example apps/application-service/.env
cp apps/notification-service/.env.example apps/notification-service/.env
cp apps/gateway/.env.example apps/gateway/.env
```

### Common variables per service

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hirehub_auth"
JWT_SECRET="your-secret-key"
PORT=4001
REDIS_URL="redis://localhost:6379"
```

> ⚠️ Never commit `.env` files. They are gitignored by default.

---

## Running the Project

### Option 1 — Docker Compose (recommended)

Starts all services, databases, and Redis in one command:

```bash
docker-compose up --build
```

### Option 2 — Run services individually

Start all services in dev mode via Turborepo:

```bash
npm run dev
```

Or start a single service:

```bash
cd apps/auth-service
npm run dev
```

### Run Prisma migrations per service

```bash
cd apps/auth-service
npx prisma migrate dev --name init
```

Repeat for each service.

---

## API Gateway

All client requests go through the gateway at `http://localhost:4000`. The gateway:

1. Intercepts the request
2. Calls `auth-service /verify` to validate the JWT
3. Strips the token and forwards the request with the decoded user context
4. Proxies to the appropriate service based on the route prefix

| Route Prefix      | Proxied To               |
| ----------------- | ------------------------ |
| `/auth/*`         | auth-service:4001        |
| `/users/*`        | user-service:4002        |
| `/jobs/*`         | job-service:4003         |
| `/applications/*` | application-service:4004 |

---

## Shared Packages

### `@hirehub/types`

Located at `packages/types`, this package contains all shared TypeScript interfaces used across services.

```ts
import { JwtPayload, JobListing, ApplicationStatus } from "@hirehub/types";
```

This ensures type consistency across service boundaries without duplication.

---

## Docker

Each service has its own `Dockerfile`. The root `docker-compose.yml` orchestrates all services along with:

- One PostgreSQL container per service (isolated databases)
- One Redis container (shared message broker)

```bash
# Build and start everything
docker-compose up --build

# Stop everything
docker-compose down

# Stop and remove volumes (wipes databases)
docker-compose down -v
```

---

## Contributing

This is a learning project but PRs and suggestions are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a PR

---

## License

MIT
