CREATE TABLE cars (
    id           BIGINT      PRIMARY KEY REFERENCES vehicles(id),
    num_seats    INTEGER     NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    fuel_type    VARCHAR(20) NOT NULL
);
