CREATE TABLE motorbikes (
    id            BIGSERIAL      PRIMARY KEY,
    brand         VARCHAR(100)   NOT NULL,
    model         VARCHAR(100)   NOT NULL,
    year          INTEGER        NOT NULL,
    engine_cc     INTEGER        NOT NULL,
    license_category VARCHAR(5) NOT NULL,
    price_per_day NUMERIC(10, 2) NOT NULL,
    available     BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);
