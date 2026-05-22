CREATE TABLE motorbikes (
    id               BIGINT      PRIMARY KEY REFERENCES vehicles(id),
    license_category VARCHAR(5)  NOT NULL,
    motorbike_type   VARCHAR(20) NOT NULL,
    abs              BOOLEAN     NOT NULL
);