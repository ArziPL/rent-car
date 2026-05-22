CREATE TABLE cars (
    id            BIGSERIAL      PRIMARY KEY,
    brand         VARCHAR(100)   NOT NULL,
    model         VARCHAR(100)   NOT NULL,
    year          INTEGER        NOT NULL,
    price_per_day NUMERIC(10, 2) NOT NULL,
    available     BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);