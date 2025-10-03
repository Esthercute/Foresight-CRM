-- Insert sample users
INSERT INTO users (email, password_hash) VALUES 
('admin@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'), -- password: password
('user@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'); -- password: password

-- Insert sample customers
INSERT INTO customers (customer_id, full_name, email, phone, address, segment) VALUES 
(1, 'Nguyễn Văn A', 'a.nguyen@example.com', '0912345678', '123 Đường ABC, Quận 1, TP.HCM', 'Premium'),
(2, 'Trần Thị B', 'b.tran@example.com', '0923456789', '456 Đường DEF, Quận 3, TP.HCM', 'Regular'),
(3, 'Lê Văn C', 'c.le@example.com', '0934567890', '789 Đường GHI, Quận 5, TP.HCM', 'VIP'),
(4, 'Phạm Thị D', 'd.pham@example.com', '0945678901', '321 Đường JKL, Quận 7, TP.HCM', 'Regular'),
(5, 'Hoàng Văn E', 'e.hoang@example.com', '0956789012', '654 Đường MNO, Quận 10, TP.HCM', 'Premium');

-- Insert sample orders
INSERT INTO orders (order_date, customer_id, status, total_amount) VALUES 
-- Customer 1 orders
('2024-01-15 10:30:00', 1, 'Completed', 1500000.00),
('2024-02-20 14:15:00', 1, 'Completed', 2200000.00),
('2024-03-10 09:45:00', 1, 'Completed', 1800000.00),
('2024-04-05 16:20:00', 1, 'Completed', 3500000.00),
('2024-05-12 11:30:00', 1, 'Completed', 2800000.00),

-- Customer 2 orders
('2024-01-22 13:45:00', 2, 'Completed', 950000.00),
('2024-02-18 10:15:00', 2, 'Completed', 1200000.00),
('2024-03-25 15:30:00', 2, 'Completed', 750000.00),
('2024-04-30 12:00:00', 2, 'Completed', 1900000.00),
('2024-05-08 14:45:00', 2, 'Completed', 1100000.00),

-- Customer 3 orders
('2024-01-08 09:20:00', 3, 'Completed', 5200000.00),
('2024-02-14 16:10:00', 3, 'Completed', 4800000.00),
('2024-03-22 11:40:00', 3, 'Completed', 6100000.00),
('2024-04-18 13:25:00', 3, 'Completed', 5500000.00),
('2024-05-25 10:50:00', 3, 'Completed', 7200000.00),

-- Customer 4 orders
('2024-01-30 15:15:00', 4, 'Completed', 850000.00),
('2024-02-27 12:30:00', 4, 'Completed', 1300000.00),
('2024-03-15 14:20:00', 4, 'Completed', 950000.00),
('2024-04-22 10:45:00', 4, 'Completed', 1650000.00),
('2024-05-18 16:35:00', 4, 'Completed', 1250000.00),

-- Customer 5 orders
('2024-01-12 11:25:00', 5, 'Completed', 2100000.00),
('2024-02-08 09:40:00', 5, 'Completed', 2400000.00),
('2024-03-30 13:15:00', 5, 'Completed', 1950000.00),
('2024-04-15 15:50:00', 5, 'Completed', 3200000.00),
('2024-05-22 12:05:00', 5, 'Completed', 2750000.00);