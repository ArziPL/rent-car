# RentCar App

Full-stack car rental application.

## Stack
- Backend: Java 17, Spring Boot 4.0.6, PostgreSQL, Docker
- Frontend: Next.js (not started yet)
- All services run via docker-compose (not yet configured)

## Backend Module: rent-car-backend

**Build:** Maven (`mvnw`), group `backend`, artifact `rent-car-backend`
**Package root:** `backend.rent_car_backend`
**Main class:** `backend.rent_car_backend.RentCarBackendApplication`

### Dependencies (pom.xml)
- `spring-boot-starter-webmvc` — REST API
- `spring-boot-starter-data-jpa` — JPA/Hibernate
- `spring-boot-starter-security` — Spring Security
- `spring-boot-starter-flyway` — DB migrations
- `springdoc-openapi-starter-webmvc-ui:3.0.2` — Swagger UI at `/swagger-ui.html`
- Test: JPA, Flyway, Security test starters

**Not yet added (needed):** PostgreSQL driver, Lombok, JWT library, validation starter

### Current Implementation Status
- Main app class only — no controllers, services, repositories, entities, or DTOs yet
- `application.properties` has only `spring.application.name=rent-car-backend` (no DB config yet)

### Database Migrations (Flyway: src/main/resources/db/migration)
- `V1__create_users_table.sql` — `users(id, email, password, role, created_at)`
- `V2__create_cars_table.sql` — `cars(id, brand, model, year, price_per_day, available, created_at)`
- `V3__create_reservations_table.sql` — `reservations(id, user_id→users, car_id→cars, start_date, end_date, status, total_price, created_at)`

## Architecture
- Monorepo: `/rent-car-backend` and `/rent-car-frontend` folders
- REST API consumed by Next.js frontend
- JWT-based authentication (planned)

## Domain
Three core tables: users, cars, reservations
- Users have roles: USER or ADMIN (RBAC)
- Cars have availability flag, price per day
- Reservations link a user to a car with a date range and calculated total price

## Design Patterns
- Strategy: PricingStrategy interface with StandardPricingStrategy and WeekendPricingStrategy (weekend days = 1.5x)
- Polymorphism: Car extends Vehicle
- Always SOLID principles

## Build Order
1. DB migrations + Entities ✅ (migrations done, entities pending)
2. Auth (register/login, JWT, Spring Security)
3. Cars CRUD (admin only)
4. Reservations (user creates, admin manages)
5. Next.js frontend

## Conventions
- Never modify already-applied Flyway migrations, always add a new one
- Use Lombok everywhere (add dependency when implementing)
- Package root: `backend.rent_car_backend`