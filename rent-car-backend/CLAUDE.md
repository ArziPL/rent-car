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
| `jjwt-api / jjwt-impl / jjwt-jackson:0.12.6` | JWT token generation and validation |
| `h2` (test) | In-memory DB for unit/integration tests |
| `spring-security-test` (test) | Security test utilities |
| `jacoco-maven-plugin:0.8.13` | Code coverage reporting (`./mvnw test` generates report) |

## Package Structure

```
backend.rent_car_backend
├── model/          ← JPA entities and enums
├── repository/     ← Spring Data JPA interfaces
├── service/        ← business logic
│   └── pricing/    ← PricingStrategy interface + implementations
├── controller/     ← REST endpoints
├── dto/            ← request/response objects
├── security/       ← JWT filter, SecurityConfig, UserDetailsServiceImpl
└── exception/      ← GlobalExceptionHandler (@RestControllerAdvice)
```

## Model Layer

### Inheritance
`Vehicle` is a full `@Entity` using `InheritanceType.JOINED` with discriminator column `vehicle_type`. `Car` and `Motorbike` are sub-entities joined by PK.

### Entities

- `Vehicle` → table `vehicles` — base: `id`, `brand`, `model`, `year` (column: `manufacture_year`), `engineCc`, `pricePerDay`, `available`, `createdAt`
  - `Car` → table `cars` — adds: `numSeats`, `transmission` (enum), `fuelType` (enum)
  - `Motorbike` → table `motorbikes` — adds: `licenseCategory` (enum), `motorbikeType` (enum), `abs`
- `User` → table `users` — `email`, `password`, `role` (enum), `createdAt`; implements `UserDetails` (Spring Security)
- `Reservation` → table `reservations` — `user` (ManyToOne), `vehicle` (ManyToOne), `startDate`, `endDate`, `status` (enum, default PENDING), `totalPrice`, `createdAt`

All `createdAt` fields use `@CreationTimestamp` (set by Hibernate on insert).

### Enums

| Enum | Values |
|---|---|
| `Role` | `USER`, `ADMIN` |
| `ReservationStatus` | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| `LicenseCategory` | `A`, `A1`, `A2` |
| `Transmission` | `MANUAL`, `AUTOMATIC` |
| `FuelType` | `PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID` |
| `MotorbikeType` | `SPORT`, `NAKED`, `CRUISER`, `SCOOTER` |

## Repository Layer

| Repository | Notable query methods |
|---|---|
| `VehicleRepository` | `findByAvailable(boolean)`, `findByIdForUpdate(Long)` — `@Lock(PESSIMISTIC_WRITE)` for safe reservation creation |
| `CarRepository` | `findByAvailable(boolean)` |
| `MotorbikeRepository` | `findByAvailable(boolean)` |
| `UserRepository` | `findByEmail(String)` |
| `ReservationRepository` | `findByUser(User)`, `findByVehicle(Vehicle)`, `findByUserId(Long)`, `existsOverlapping(...)`, `existsByVehicleIdAndStatusNot(Long, ReservationStatus)` |

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

`application.properties` uses env-var placeholders — **no default values for secrets**.
All credentials must be provided via environment variables:

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Base64-encoded 256-bit HS256 signing key |
| `DB_USERNAME` | Datasource username |
| `DB_PASSWORD` | Datasource password |

Local dev: export vars in your shell or use an `.env` file loaded by your IDE.
Docker Compose: vars are loaded from repo-root `.env` via `env_file` and forwarded to the backend.
Tests: `src/test/resources/application.properties` has a **hardcoded test-only** secret — never deployed.

## Auth Layer

### Security package (`security/`)
- `SecurityConfig` — stateless JWT filter chain; permits `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`; all other routes require authentication
- `JwtAuthenticationFilter` — `OncePerRequestFilter`; reads `Authorization: Bearer <token>`, validates via `JwtService`, sets `SecurityContext`.
  **Exception safety:** `JwtException` (expired, malformed, bad signature) is caught and swallowed — the request continues unauthenticated (Spring Security enforces 401 downstream). Never returns 500 on bad tokens.
- `UserDetailsServiceImpl` — loads `User` by email for Spring Security

### JWT (`service/JwtService`)
- Library: `jjwt` 0.12.6
- Config keys in `application.properties`: `jwt.secret` (Base64 HS256 key), `jwt.expiration` (ms, default 86400000 = 24h)
- Methods: `generateToken`, `extractEmail`, `isTokenValid`

### Auth endpoints (`POST /api/auth/`)

| Endpoint | Request body | Response |
|---|---|---|
| `POST /api/auth/register` | `{email, password}` (validated) | `{token, email, role}` 201 |
| `POST /api/auth/login` | `{email, password}` | `{token, email, role}` 200 |

- Register validates: `@Email`, `@NotBlank`, `@Size(min=6)` on password; returns 400 with field errors on violation
- Duplicate email → 400 `{"error": "Email already in use"}`
- Bad credentials → 401 `{"error": "Invalid email or password"}`
- New users always get `Role.USER`; no admin self-registration

### DTOs
- `RegisterRequest` — `email` (@Email, @NotBlank), `password` (@NotBlank, @Size min=6)
- `LoginRequest` — `email`, `password` (no constraints, validated by Spring Security)
- `AuthResponse` — `token`, `email`, `role`

### Exception handling (`exception/GlobalExceptionHandler`)
Handles:
- `EntityNotFoundException` → 404
- `IllegalArgumentException` → 400
- `BadCredentialsException` → 401
- `MethodArgumentNotValidException` → 400 with field-level errors map
- `DataIntegrityViolationException` → 409 `{"error": "Operation violates a data constraint"}`

## Service Layer Conventions

All service classes are annotated `@Transactional` at the class level:
- Write methods inherit the class-level `@Transactional` (default propagation `REQUIRED`)
- Read-only methods override with `@Transactional(readOnly = true)` for performance
- `ReportService` is `@Transactional(readOnly = true)` at class level (all methods are reads)
- `JwtService` has no JPA interaction — no `@Transactional`

**Never remove `@Transactional` from services.** Multi-step writes (create reservation, cancel, updateStatus) must be atomic.

## Tests

- `AuthControllerTest` — MockMvc integration tests for register/login endpoints
- `AuthServiceTest` — unit tests for `AuthService` (register/login logic, duplicate email)
- `JwtServiceTest` — unit tests for token generation, extraction, expiry validation
- `CarServiceTest`, `MotorbikeServiceTest`, `VehicleServiceTest` — service-layer unit tests
- `CarControllerTest`, `MotorbikeControllerTest`, `VehicleControllerTest`, `VehicleAdminControllerTest` — MockMvc controller tests
- `PricingStrategyTest` — unit tests for Standard and Weekend pricing strategies
- `ReservationServiceTest` — full coverage of create/cancel/updateStatus including state-machine transitions and overlap re-check
- `ReservationControllerTest` — user + admin endpoints; admin test asserts `userId`/`userEmail` in response
- `ReportServiceTest` — weekday/weekend day counting and CANCELLED exclusion
- Test datasource: H2 in-memory (see `src/test/resources/application.properties`)
- Coverage: JaCoCo report generated on `./mvnw test` → `target/site/jacoco/`

## Vehicles API

### Security
- `/api/admin/**` → requires `ROLE_ADMIN`
- `GET /api/vehicles/**` → public (guests allowed, no token required)
- `/api/reservations/**` → requires any authenticated user (cancel validates ownership in service)

### Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/vehicles` | AUTH | List all vehicles (optional `?available=true`) |
| GET | `/api/vehicles/cars` | AUTH | List all cars |
| GET | `/api/vehicles/cars/{id}` | AUTH | Get car by id |
| GET | `/api/vehicles/motorbikes` | AUTH | List all motorbikes |
| GET | `/api/vehicles/motorbikes/{id}` | AUTH | Get motorbike by id |
| POST | `/api/admin/vehicles/cars` | ADMIN | Create car (201) |
| PUT | `/api/admin/vehicles/cars/{id}` | ADMIN | Update car |
| POST | `/api/admin/vehicles/motorbikes` | ADMIN | Create motorbike (201) |
| PUT | `/api/admin/vehicles/motorbikes/{id}` | ADMIN | Update motorbike |
| DELETE | `/api/admin/vehicles/{id}` | ADMIN | Delete vehicle (any type, 204) |

**Vehicle deletion guard:** `DELETE` is rejected with 400 if any non-CANCELLED reservation references the vehicle. This protects referential integrity and audit history. Only vehicles with exclusively CANCELLED (or no) reservations can be deleted.

### DTOs
- `CarRequest` / `CarResponse` — brand, model, year, engineCc, pricePerDay, numSeats, transmission, fuelType
- `MotorbikeRequest` / `MotorbikeResponse` — brand, model, year, engineCc, pricePerDay, licenseCategory, motorbikeType, abs
- `VehicleResponse` — id, brand, model, year, pricePerDay, available, type ("CAR"/"MOTORBIKE"); returned by `/api/vehicles`

Type detection in `VehicleService.toResponse()` uses `instanceof Car ? "CAR" : "MOTORBIKE"` — no discriminator field on entity.

## PricingStrategy Pattern

Interface: `service/pricing/PricingStrategy` — `BigDecimal calculate(LocalDate start, LocalDate end, BigDecimal pricePerDay)`

- `StandardPricingStrategy` — `@Component`: `pricePerDay × days`
- `WeekendPricingStrategy` — `@Component @Primary`: weekdays × pricePerDay + weekend days × pricePerDay × 1.5

`@Primary` on Weekend makes it the default injection. Weekend = Saturday + Sunday. End date is exclusive.

## Reservations API

### Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/api/reservations` | AUTH | Create reservation (201) |
| GET | `/api/reservations` | AUTH | List current user's reservations |
| DELETE | `/api/reservations/{id}` | AUTH | Cancel own PENDING reservation (204) |
| GET | `/api/admin/reservations` | ADMIN | List all reservations |
| PUT | `/api/admin/reservations/{id}/status` | ADMIN | Update status (CONFIRMED or CANCELLED) |

### Business rules
- Vehicle must be `available = true`
- `endDate` must be after `startDate`
- No overlapping CONFIRMED reservations for the same vehicle (half-open interval: `start < otherEnd AND end > otherStart`)
- `totalPrice` calculated at creation via `WeekendPricingStrategy`
- Only `PENDING` reservations can be cancelled by user; `CONFIRMED` and `COMPLETED` reservations cannot be cancelled
- Principal extracted via `SecurityContextHolder.getContext().getAuthentication().getName()` (returns email string, safe for `@WithMockUser` in tests)

### Reservation status state machine (enforced in `ReservationService.updateStatus`)

```
PENDING ──► CONFIRMED ──► COMPLETED
   │              │              │
   └──────────────┴──────────────┴──► CANCELLED (terminal)
```

- `PENDING → CONFIRMED | CANCELLED`
- `CONFIRMED → COMPLETED | CANCELLED`
- `COMPLETED → CANCELLED` (last escape hatch)
- `CANCELLED` → nothing (terminal state)
- Any other transition throws `IllegalArgumentException("Invalid status transition: X → Y")`
- Before confirming (`→ CONFIRMED`), `existsOverlapping` is re-checked to prevent admin double-booking

### Concurrency safety
`ReservationService.create()` uses `vehicleRepository.findByIdForUpdate()` (`PESSIMISTIC_WRITE` lock) inside a `@Transactional` boundary. The vehicle row is locked from the overlap check through the INSERT, preventing double-booking under concurrent requests.

### DTOs
- `ReservationRequest` — vehicleId (@NotNull), startDate (@NotNull @Future), endDate (@NotNull)
- `ReservationResponse` — id, vehicleId, vehicleBrand, vehicleModel, startDate, endDate, status, totalPrice, createdAt
- `AdminReservationResponse` — same as `ReservationResponse` **plus** `userId`, `userEmail` — returned by `GET /api/admin/reservations` only
- `UpdateReservationStatusRequest` — status (@NotNull)

## Report API

### Endpoint

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/admin/report/cars` | ADMIN | All cars with reservation stats |

### Response: `CarReportResponse`
Car spec fields (same as `CarResponse`) plus:
- `reservationCount` — non-cancelled reservations
- `totalRevenue` — sum of `totalPrice` (non-cancelled)
- `weekdayDays` — Mon–Fri rental days across all non-cancelled reservations
- `weekendDays` — Sat–Sun rental days across all non-cancelled reservations

### Implementation
- `ReportService` — iterates all cars, calls `reservationRepository.findByVehicle(car)`, filters out `CANCELLED`, computes stats
- `ReportAdminController` — delegates to `ReportService`
- Auto-protected by existing `/api/admin/**` → `hasRole("ADMIN")` rule (no SecurityConfig change needed)

## Implementation Status

- [x] Dependencies configured (Java 21, Flyway PostgreSQL driver, JWT, JaCoCo)
- [x] Flyway migrations (5 tables)
- [x] JPA entities + enums
- [x] Repositories
- [x] Auth — register/login endpoints, JWT, Spring Security config, GlobalExceptionHandler, tests
- [x] Vehicles CRUD — Cars + Motorbikes (admin write, authenticated read), VehicleService with polymorphic type detection
- [x] PricingStrategy — Standard + Weekend (1.5x) with @Primary on Weekend
- [x] Reservations API — user create/list/cancel, admin list/status-update, overlap detection, pricing
- [x] Report API — `GET /api/admin/report/cars` with per-car reservation stats
- [x] Security hardening
  - Secrets externalized to env vars (no defaults in `application.properties`)
  - JWT filter catches `JwtException` → 401, never 500
  - `@Transactional` on all services (readOnly overrides on reads)
  - Pessimistic write lock on vehicle during reservation creation
  - Reservation status state machine enforced with overlap re-check on CONFIRMED
  - Vehicle deletion guarded against active reservations (400)
  - `DataIntegrityViolationException` → 409 in GlobalExceptionHandler
  - `AdminReservationResponse` with `userId`/`userEmail` for admin reservation listing
