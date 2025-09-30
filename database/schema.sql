CREATE TABLE order (
    id SERIAL PRIMARY KEY,
    tran_date TIMESTAMP
    customer_id INT REFERENCES customer(id),
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL
)