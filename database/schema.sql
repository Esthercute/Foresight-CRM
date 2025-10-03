-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    segment VARCHAR(50) DEFAULT 'Regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (renamed from 'order' to 'orders' and fixed column names)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_date TIMESTAMP NOT NULL,
    customer_id INT REFERENCES customers(customer_id),
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL
);