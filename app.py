# File: app.py

import os
import json
import hashlib
import psycopg2
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from functools import wraps
from flask_cors import CORS 

# Tải biến môi trường từ file .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Cho phép CORS cho tất cả các route

# Cấu hình Database từ biến môi trường
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

# --- CHỨC NĂNG KẾT NỐI DATABASE ---
def get_db_connection():
    """Tạo và trả về kết nối tới PostgreSQL."""
    try:
        # Sử dụng RealDictCursor để kết quả truy vấn trả về dưới dạng Dictionary (JSON-friendly)
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Lỗi kết nối database: {e}")
        return None

# --- CHỨC NĂNG MÃ HÓA MẬT KHẨU (Sử dụng SHA-256) ---
# LƯU Ý: TRÊN THỰC TẾ NÊN DÙNG THƯ VIỆN BCRYPT HOẶC ARGON2!
def hash_password(password):
    """Mã hóa mật khẩu bằng SHA-256."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

# ==========================================================
#                         API ROUTES
# ==========================================================

# 1. API ĐĂNG NHẬP (USER LOGIN)
@app.route('/api/login', methods=['POST'])
def login():
    """Xử lý yêu cầu đăng nhập từ Front-end."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Please provide username and password."}), 400

    # Mã hóa mật khẩu nhận được từ người dùng để so sánh với DB
    hashed_password = hash_password(password)

    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Server connection error."}), 500

    try:
        with conn.cursor() as cur:
            # Truy vấn để tìm người dùng dựa trên username/email và mật khẩu đã mã hóa
            # LƯU Ý: Cột 'password_hash' cần tồn tại trong bảng users của bạn
            cur.execute(
                "SELECT id, full_name FROM users WHERE email = %s AND password_hash = %s",
                (username, hashed_password)
            )
            user = cur.fetchone()
            
            if user:
                # TRÊN THỰC TẾ: TẠO VÀ TRẢ VỀ JSON WEB TOKEN (JWT)
                # Ví dụ: token = generate_jwt(user['id'])
                return jsonify({
                    "message": "Login successful!",
                    "user_id": user['id'],
                    "full_name": user['full_name'],
                    "token": "fake_jwt_token_12345"
                }), 200
            else:
                return jsonify({"message": "Incorrect username or password."}), 401

    except Exception as e:
        conn.rollback()
        print(f"Login query error: {e}")
        return jsonify({"message": "Internal server error."}), 500
    finally:
        conn.close()


# 2. API Ví dụ cho Dashboard (Cần xác thực/token)
# (Chúng ta sẽ hoàn thiện API này sau, nhưng nó minh họa cấu trúc)
@app.route('/api/dashboard/revenue', methods=['GET'])
def get_revenue_data():
    # Ví dụ đơn giản, TRÊN THỰC TẾ: CẦN CÓ LOGIC XÁC THỰC TOKEN TRƯỚC
    
    # Lấy tham số thời gian từ URL (ví dụ: /api/dashboard/revenue?start_date=...)
    start_date = request.args.get('start_date', '2024-01-01')
    
    # ... logic truy vấn DB theo start_date ...
    
    # Dữ liệu giả định trả về
    mock_data = {
        "labels": ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4'],
        "revenue": [15000, 18000, 25000, 22000]
    }
    return jsonify(mock_data)

if __name__ == '__main__':
    # Chạy trên cổng 5000
    app.run(debug=True, port=5000)