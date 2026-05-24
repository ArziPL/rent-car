# RentCar App

Full-stack car rental application.

## Stack
- Backend: Java 21, Spring Boot 4.0.6, PostgreSQL, Docker
- Frontend: Next.js (not started yet)
- All services run via `docker-compose.yml` at repo root

## Infrastructure
- `docker-compose.yml` — starts `db` (postgres:16, port 5432) and `backend` (port 8080)
- `rent-car-backend/Dockerfile` — two-stage Maven build → JRE runtime image
- Backend overrides datasource URL via `SPRING_DATASOURCE_URL` env var when running in compose

## Architecture
- Monorepo: `/rent-car-backend` and `/rent-car-frontend` folders
- REST API consumed by Next.js frontend
- JWT-based authentication (implemented — `POST /api/auth/register`, `POST /api/auth/login`)

## Domain
- `users` — roles: USER or ADMIN (RBAC)
- `vehicles` — parent table; shared fields: brand, model, year, engine_cc, price_per_day, available, created_at
  - `cars` — adds: num_seats, transmission, fuel_type
  - `motorbikes` — adds: license_category (A/A1/A2), motorbike_type, abs
- `reservations` — links user to vehicle (car or motorbike) with date range, status, and total price

## Design Patterns
- Strategy: `PricingStrategy` interface → `StandardPricingStrategy`, `WeekendPricingStrategy` (weekend = 1.5x)
- Polymorphism: `Car` and `Motorbike` extend `Vehicle` using JPA JOINED inheritance (`@Inheritance(strategy = InheritanceType.JOINED)`)
- Always SOLID principles

## Build Order
1. DB migrations + Entities ✅
2. Auth (register/login, JWT, Spring Security) ✅
3. Vehicles CRUD — Cars + Motorbikes (admin write, authenticated read) ✅
4. PricingStrategy pattern + Reservations API ✅
5. Next.js frontend

## Conventions
- Never modify already-applied Flyway migrations, always add a new one
- Use Lombok everywhere
- Package root: `backend.rent_car_backend`
- See `rent-car-backend/CLAUDE.md` for backend implementation details