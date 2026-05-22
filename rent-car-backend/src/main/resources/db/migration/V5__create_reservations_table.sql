CREATE TABLE reservations (
    id          BIGSERIAL      PRIMARY KEY,
    user_id     BIGINT         NOT NULL REFERENCES users(id),
    vehicle_id  BIGINT         NOT NULL REFERENCES vehicles(id),
    start_date  DATE           NOT NULL,
    end_date    DATE           NOT NULL,
    status      VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    total_price NUMERIC(10,2)  NOT NULL,
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);