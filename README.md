# Pathway — Job Application Tracker

A full-stack app for tracking job applications through your search — company,
role, status, dates, notes — with a dashboard that shows your pipeline at a
glance.

Built to practice: Spring Boot REST APIs, Spring Security with JWT, JPA
relationships, and a React frontend with protected routes and real API
integration.

## Tech stack

**Backend**
- Java 17, Spring Boot 3.3
- Spring Security + JWT (stateless auth)
- Spring Data JPA / Hibernate
- H2 (file-based, zero config) — Postgres profile also included
- Bean Validation (`@Valid`)
- Global exception handling (`@RestControllerAdvice`)
- OpenAPI / Swagger UI

**Frontend**
- React 18 + Vite
- React Router v6 (protected routes)
- Axios with request/response interceptors (auto-attaches JWT, handles 401s)
- Context API for auth state
- Plain CSS with a small design-token system (no UI framework)

## Features

- Register / log in with JWT-based auth; passwords hashed with BCrypt
- Each user only ever sees their own applications (enforced server-side, not
  just hidden in the UI)
- Create, edit, delete, and view applications
- Search by company/position, filter by status, paginated list
- Dashboard with total/active/offer counts and a per-stage pipeline view
- Consistent API error shape with field-level validation messages

## Project structure

```
job-tracker/
├── backend/                 Spring Boot API
│   └── src/main/java/com/jobtracker/
│       ├── config/           Security + OpenAPI config
│       ├── security/         JWT filter, util, user details service
│       ├── model/             User, JobApplication, enums
│       ├── repository/       Spring Data JPA repositories
│       ├── dto/                Request/response DTOs
│       ├── service/           Business logic
│       ├── controller/       REST endpoints
│       └── exception/        Custom exceptions + global handler
├── frontend/                 React (Vite) app
│   └── src/
│       ├── api/               Axios instance
│       ├── context/           AuthContext
│       ├── components/       Navbar, StatusBadge, PrivateRoute
│       └── pages/              Login, Register, Dashboard, Applications, ApplicationForm
└── docker-compose.yml        Optional Postgres for local dev
```

## Running it locally

### 1. Backend (Spring Boot)

Requires Java 17+ and Maven (or use the included `mvnw` if you add one).

```bash
cd backend
mvn spring-boot:run
```

This runs with the default `h2` profile — no database setup needed. It
creates a file-based H2 database under `backend/data/`. The API comes up on
`http://localhost:8080`.

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 console (dev only): `http://localhost:8080/h2-console`
  (JDBC URL: `jdbc:h2:file:./data/jobtracker`, user `sa`, no password)

**Optional: use Postgres instead**

```bash
docker compose up -d
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

### 2. Frontend (React)

Requires Node 18+.

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173` and proxies `/api` calls to the backend on
port 8080 (see `vite.config.js`).

## API overview

| Method | Endpoint                  | Description                          |
|--------|----------------------------|---------------------------------------|
| POST   | `/api/auth/register`       | Create an account, returns a JWT      |
| POST   | `/api/auth/login`          | Log in, returns a JWT                 |
| GET    | `/api/applications`        | List applications (search/status/page)|
| POST   | `/api/applications`        | Create an application                 |
| GET    | `/api/applications/{id}`   | Get one application                   |
| PUT    | `/api/applications/{id}`   | Update an application                 |
| DELETE | `/api/applications/{id}`   | Delete an application                 |
| GET    | `/api/applications/stats`  | Dashboard stats (counts by status)    |

All `/api/applications/**` endpoints require `Authorization: Bearer <token>`.

## Notes / things to extend

- No refresh tokens yet — the JWT is valid for 24h, then you're logged out.
- No tests included yet; a natural next step is `@WebMvcTest` /
  `@DataJpaTest` for the controller and repository layers.
- The status pipeline (`WISHLIST → APPLIED → OA_ASSESSMENT → INTERVIEW →
  OFFER / REJECTED / WITHDRAWN`) is intentionally simple — could be extended
  with a status-change history/timeline per application.
