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

## Auth Layer

### Security package (`security/`)
- `SecurityConfig` — stateless JWT filter chain; permits `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`; all other routes require authentication
- `JwtAuthenticationFilter` — `OncePerRequestFilter`; reads `Authorization: Bearer <token>`, validates via `JwtService`, sets `SecurityContext`
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
Handles: `IllegalArgumentException` → 400, `BadCredentialsException` → 401, `MethodArgumentNotValidException` → 400 with field-level errors map.

## Tests

- `AuthControllerTest` — MockMvc integration tests for register/login endpoints
- `AuthServiceTest` — unit tests for `AuthService` (register/login logic, duplicate email)
- `JwtServiceTest` — unit tests for token generation, extraction, expiry validation
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
- Admin status lifecycle: `PENDING → CONFIRMED → COMPLETED` (or any → `CANCELLED`); cannot set status back to `PENDING`
- Principal extracted via `SecurityContextHolder.getContext().getAuthentication().getName()` (returns email string, safe for `@WithMockUser` in tests)

### DTOs
- `ReservationRequest` — vehicleId (@NotNull), startDate (@NotNull @Future), endDate (@NotNull)
- `ReservationResponse` — id, vehicleId, vehicleBrand, vehicleModel, startDate, endDate, status, totalPrice, createdAt
- `UpdateReservationStatusRequest` — status (@NotNull)

## Repository additions (`ReservationRepository`)
- `findByUserId(Long userId)` — derive by convention
- `existsOverlapping(vehicleId, startDate, endDate, status)` — JPQL overlap query with typed enum param

## Implementation Status

- [x] Dependencies configured (Java 21, Flyway PostgreSQL driver, JWT, JaCoCo)
- [x] Flyway migrations (5 tables)
- [x] JPA entities + enums
- [x] Repositories
- [x] Auth — register/login endpoints, JWT, Spring Security config, GlobalExceptionHandler, tests
- [x] Vehicles CRUD — Cars + Motorbikes (admin write, authenticated read), VehicleService with polymorphic type detection
- [x] PricingStrategy — Standard + Weekend (1.5x) with @Primary on Weekend
- [x] Reservations API — user create/list/cancel, admin list/status-update, overlap detection, pricing
