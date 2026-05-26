# Database ERD — RentCar

```mermaid
erDiagram

    users {
        BIGSERIAL  id          PK
        VARCHAR255 email           "UNIQUE NOT NULL"
        VARCHAR255 password        "NOT NULL"
        VARCHAR20  role            "USER or ADMIN, DEFAULT USER"
        TIMESTAMP  created_at      "DEFAULT NOW()"
    }

    vehicles {
        BIGSERIAL  id               PK
        VARCHAR20  vehicle_type         "discriminator: CAR or MOTORBIKE"
        VARCHAR100 brand                "NOT NULL"
        VARCHAR100 model                "NOT NULL"
        INTEGER    manufacture_year     "NOT NULL"
        INTEGER    engine_cc            "NOT NULL"
        NUMERIC    price_per_day        "scale 10,2  NOT NULL"
        BOOLEAN    available            "DEFAULT TRUE"
        TIMESTAMP  created_at           "DEFAULT NOW()"
    }

    cars {
        BIGINT    id              PK  "FK -> vehicles.id"
        INTEGER   num_seats           "NOT NULL"
        VARCHAR20 transmission        "MANUAL or AUTOMATIC"
        VARCHAR20 fuel_type           "PETROL, DIESEL, ELECTRIC, HYBRID"
    }

    motorbikes {
        BIGINT   id                  PK  "FK -> vehicles.id"
        VARCHAR5 license_category        "A, A1, A2"
        VARCHAR20 motorbike_type         "SPORT, NAKED, CRUISER, SCOOTER"
        BOOLEAN  abs                     "NOT NULL"
    }

    reservations {
        BIGSERIAL id          PK
        BIGINT    user_id     FK
        BIGINT    vehicle_id  FK
        DATE      start_date      "NOT NULL"
        DATE      end_date        "NOT NULL"
        VARCHAR20 status          "PENDING, CONFIRMED, COMPLETED, CANCELLED"
        NUMERIC   total_price     "scale 10,2  NOT NULL"
        TIMESTAMP created_at      "DEFAULT NOW()"
    }

    vehicles  ||--o|  cars         : "extends (JOINED)"
    vehicles  ||--o|  motorbikes   : "extends (JOINED)"
    users     ||--o{  reservations : "makes"
    vehicles  ||--o{  reservations : "reserved in"
```

## Notes

| Concept | Detail |
|---|---|
| Inheritance | `vehicles` is the parent table. `cars` and `motorbikes` share the same `id` (PK = FK to `vehicles.id`). JPA `@Inheritance(strategy = JOINED)` with `vehicle_type` discriminator column. |
| `cars.id` | `BIGINT PRIMARY KEY REFERENCES vehicles(id)` — no separate sequence |
| `motorbikes.id` | Same pattern as `cars.id` |
| Reservation status | State machine: `PENDING -> CONFIRMED -> COMPLETED`; any non-CANCELLED -> `CANCELLED` (terminal) |
| Role values | `USER` (default on registration), `ADMIN` |
