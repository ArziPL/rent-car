# rent-car-backend

Spring Boot 4.0.6 / Java 21 REST API for the RentCar platform.

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
| `flyway-database-postgresql` | Flyway 10+ PostgreSQL driver (required separately) |
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

### Inheritance
`Vehicle` is a full `@Entity` using `InheritanceType.JOINED` with discriminator column `vehicle_type`. `Car` and `Motorbike` are sub-entities joined by PK.

### Entities

- `Vehicle` → table `vehicles` — base: `id`, `brand`, `model`, `year`, `engineCc`, `pricePerDay`, `available`, `createdAt`
  - `Car` → table `cars` — adds: `numSeats`, `transmission` (enum), `fuelType` (enum)
  - `Motorbike` → table `motorbikes` — adds: `licenseCategory` (enum), `motorbikeType` (enum), `abs`
- `User` → table `users` — `email`, `password`, `role` (enum), `createdAt`
- `Reservation` → table `reservations` — `user` (ManyToOne), `vehicle` (ManyToOne), `startDate`, `endDate`, `status` (enum, default PENDING), `totalPrice`, `createdAt`

All `createdAt` fields use `@CreationTimestamp` (set by Hibernate on insert).

### Enums

| Enum | Values |
|---|---|
| `Role` | `USER`, `ADMIN` |
| `ReservationStatus` | `PENDING`, `CONFIRMED`, `CANCELLED` |
| `LicenseCategory` | `A`, `A1`, `A2` |
| `Transmission` | `MANUAL`, `AUTOMATIC` |
| `FuelType` | `PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID` |
| `MotorbikeType` | `SPORT`, `NAKED`, `CRUISER`, `SCOOTER` |

## Repository Layer

| Repository | Notable query methods |
|---|---|
| `VehicleRepository` | `findByAvailable(boolean)` |
| `CarRepository` | `findByAvailable(boolean)` |
| `MotorbikeRepository` | `findByAvailable(boolean)` |
| `UserRepository` | `findByEmail(String)` |
| `ReservationRepository` | `findByUser(User)`, `findByVehicle(Vehicle)` |

## Database Migrations (Flyway)

One table per migration file. Never edit applied migrations — always add a new `Vn__` file.

| File | Table created |
|---|---|
| `V1__create_users_table.sql` | `users` |
| `V2__create_vehicles_table.sql` | `vehicles` |
| `V3__create_cars_table.sql` | `cars` |
| `V4__create_motorbikes_table.sql` | `motorbikes` |
| `V5__create_reservations_table.sql` | `reservations` |

## Configuration

`application.properties` uses `localhost:5432` for local dev.
docker-compose overrides via `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/rentcar`.

## Implementation Status

- [x] Dependencies configured (Java 21, Flyway PostgreSQL driver)
- [x] Flyway migrations (5 tables)
- [x] JPA entities + enums
- [x] Repositories
- [ ] Auth — JWT, Spring Security config, register/login endpoints
- [ ] Vehicles CRUD (admin only)
- [ ] Reservations API
- [ ] PricingStrategy (Standard + Weekend)
