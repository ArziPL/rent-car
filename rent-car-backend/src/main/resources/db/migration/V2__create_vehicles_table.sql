CREATE TABLE vehicles (
    id            BIGSERIAL      PRIMARY KEY,
    vehicle_type  VARCHAR(20)    NOT NULL,
    brand         VARCHAR(100)   NOT NULL,
    model         VARCHAR(100)   NOT NULL,
    manufacture_year INTEGER        NOT NULL,
    engine_cc     INTEGER        NOT NULL,
    price_per_day NUMERIC(10,2)  NOT NULL,
    available     BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);