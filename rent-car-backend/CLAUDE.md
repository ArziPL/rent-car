# rent-car-backend

Spring Boot 4.0.6 / Java 17 REST API for the RentCar platform.

## Requirements

`Wymagania_do_projektu.pdf` (in this directory) is the authoritative source of truth for all backend decisions — architecture, features, endpoints, business rules. Before implementing anything, verify it aligns with the PDF. When in doubt, the PDF wins.

## Build & Run

```bash
# local dev (requires PostgreSQL on localhost:5432)
./mvnw spring-boot:run

# via docker-compose (from repo root)
docker compose up --build

# tests
./mvnw test
```

Swagger UI: `http://localhost:8080/swagger-ui.html`

## Dependencies

| Dependency | Purpose |
|---|---|
| `spring-boot-starter-webmvc` | REST API |
| `spring-boot-starter-data-jpa` | JPA / Hibernate |
| `spring-boot-starter-security` | Spring Security |
| `spring-boot-starter-flyway` | DB migrations |
| `spring-boot-starter-validation` | Bean Validation |
| `postgresql` | PostgreSQL JDBC driver (runtime) |
| `lombok` | Boilerplate reduction |
| `springdoc-openapi-starter-webmvc-ui:3.0.2` | Swagger UI |

**Still needed:** JWT library (for auth, next step)

## Package Structure

```
backend.rent_car_backend
├── model/          ← JPA entities and enums
├── repository/     ← Spring Data JPA interfaces
├── service/        ← business logic (not yet created)
├── controller/     ← REST endpoints (not yet created)
└── dto/            ← request/response objects (not yet created)
```

## Model Layer

### Entities
- `Vehicle` (`@MappedSuperclass`) — shared base: `id`, `brand`, `model`, `year`, `engineCc`
  - `Car` → table `cars` — adds: `numSeats`, `pricePerDay`, `available`, `createdAt`
  - `Motorbike` → table `motorbikes` — adds: `licenseCategory`, `pricePerDay`, `available`, `createdAt`
- `User` → table `users` — `email`, `password`, `role`, `createdAt`
- `Reservation` → table `reservations` — `user` (ManyToOne), `car` (ManyToOne), `startDate`, `endDate`, `status`, `totalPrice`, `createdAt`

### Enums
- `Role` — `USER`, `ADMIN`
- `ReservationStatus` — `PENDING`, `CONFIRMED`, `CANCELLED`
- `LicenseCategory` — `A`, `A1`, `A2`

## Repository Layer

| Repository | Notable query methods |
|---|---|
| `UserRepository` | `findByEmail(String)` |
| `CarRepository` | `findByAvailable(boolean)` |
| `MotorbikeRepository` | `findByAvailable(boolean)` |
| `ReservationRepository` | `findByUser(User)`, `findByCar(Car)` |

## Database Migrations (Flyway)

| File | Table |
|---|---|
| `V1__create_users_table.sql` | `users` |
| `V2__create_cars_table.sql` | `cars` |
| `V3__create_reservations_table.sql` | `reservations` |
| `V4__create_motorbikes_table.sql` | `motorbikes` |

**Never edit applied migrations — always add a new `Vn__` file.**

## Configuration

`application.properties` uses `localhost:5432` for local dev.
docker-compose overrides via `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/rentcar`.

## Implementation Status

- [x] Dependencies configured
- [x] Flyway migrations (4 tables)
- [x] JPA entities + enums
- [x] Repositories
- [ ] Auth — JWT, Spring Security config, register/login endpoints
- [ ] Cars CRUD (admin only)
- [ ] Reservations API
- [ ] PricingStrategy (Standard + Weekend)