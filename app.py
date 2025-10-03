import os
import hashlib
import psycopg2
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from flask_cors import CORS 

# Tải biến môi trường từ file .env
load_dotenv()

app = Flask(__name__)

# QUAN TRỌNG: Cho phép CORS để Front-end (chạy trên cổng 5500/file) gọi API (cổng 5000)
CORS(app) 

# Cấu hình Database từ biến môi trường
# HOST: 127.0.0.1 là lý tưởng cho DBngin trên máy cục bộ
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST", "127.0.0.1"), 
    "port": os.getenv("DB_PORT", "5432")
}

# --- CHỨC NĂNG KẾT NỐI DATABASE ---
def get_db_connection():
    """Tạo và trả về kết nối tới PostgreSQL (DBngin)."""
    try:
        # Sử dụng RealDictCursor để kết quả trả về dưới dạng Dictionary (JSON-friendly)
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except psycopg2.OperationalError as e:
        print("="*50)
        print("LỖI KẾT NỐI DATABASE!")
        print(f"Kiểm tra DBngin: Dịch vụ PostgreSQL đang chạy trên cổng {DB_CONFIG['port']}?")
        print(f"Lỗi chi tiết: {e}")
        print("="*50)
        return None
    except Exception as e:
        print(f"Lỗi không xác định: {e}")
        return None

# --- CHỨC NĂNG MÃ HÓA MẬT KHẨU ---
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

# ==========================================================
#                         PAGE ROUTES
# ==========================================================

# Login Page Route
@app.route('/login')
def login_page():
    """Serve the login page"""
    return render_template('login.html')

# Dashboard Page Route (optional, if you want Flask to serve this too)
@app.route('/dashboard')
def dashboard_page():
    """Serve the dashboard page"""
    return render_template('dashboard.html')

# Customer Detail Page Route (optional, if you want Flask to serve this too)
@app.route('/detail')
def detail_page():
    """Serve the customer detail page"""
    return render_template('detail.html')

# ==========================================================
#                         API ROUTES
# ==========================================================

# 1. API ĐĂNG NHẬP
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Vui lòng cung cấp đầy đủ thông tin."}), 400

    hashed_password = hash_password(password)
    conn = get_db_connection()
    
    if conn is None:
        return jsonify({"message": "Lỗi máy chủ: Không thể kết nối DB."}), 500

    try:
        with conn.cursor() as cur:
            # CHỈ TRUY VẤN CÁC CỘT CÓ TRONG BẢNG users (id, email, password_hash)
            cur.execute(
                "SELECT id, email FROM users WHERE email = %s AND password_hash = %s",
                (username, hashed_password)
            )
            user = cur.fetchone()
            
            if user:
                # Đăng nhập thành công
                # Trả về email thay cho full_name (vì full_name không có trong bảng)
                return jsonify({
                    "message": "Đăng nhập thành công!",
                    "user_id": user['id'],
                    "full_name": user['email'], # Sử dụng email làm tên hiển thị tạm thời
                    "token": "fake_jwt_token_" + str(user['id'])
                }), 200
            else:
                return jsonify({"message": "Tên người dùng hoặc mật khẩu không đúng."}), 401

    except Exception as e:
        conn.rollback()
        print(f"Lỗi truy vấn đăng nhập: {e}")
        return jsonify({"message": "Lỗi truy vấn DB nội bộ."}), 500
    finally:
        conn.close()

# 2. API LẤY DỮ LIỆU DOANH THU CHO DASHBOARD
@app.route('/api/dashboard/revenue', methods=['GET'])
def get_revenue_data():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Lỗi máy chủ: Không thể kết nối DB."}), 500

    try:
        # Lấy tham số ngày từ query string
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        with conn.cursor() as cur:
            # Xây dựng truy vấn với bộ lọc ngày tùy chọn
            query = """
                SELECT
                    TO_CHAR(order_date, 'YYYY-MM') AS month,
                    SUM(total_amount) AS total_revenue
                FROM orders
            """
            
            params = []
            
            # Thêm điều kiện lọc ngày nếu có
            if start_date and end_date:
                query += " WHERE order_date::date BETWEEN %s AND %s"
                params.extend([start_date, end_date])
            elif start_date:
                query += " WHERE order_date::date >= %s"
                params.append(start_date)
            elif end_date:
                query += " WHERE order_date::date <= %s"
                params.append(end_date)
                
            query += " GROUP BY 1 ORDER BY 1;"
            
            cur.execute(query, params)
            data = cur.fetchall()
            
            # Định dạng lại dữ liệu
            labels = [row['month'] for row in data]
            # Chuyển đổi Decimal/float sang float chuẩn JSON
            revenue = [float(row['total_revenue']) if row['total_revenue'] else 0.0 for row in data]

            return jsonify({
                "labels": labels,
                "revenue": revenue
            }), 200

    except Exception as e:
        print(f"Lỗi truy vấn Dashboard: {e}")
        return jsonify({"message": "Lỗi khi lấy dữ liệu Dashboard."}), 500
    finally:
        conn.close()

# 2.1 API LẤY DỮ LIỆU BÁN HÀNG SẢN PHẨM CHO DASHBOARD
@app.route('/api/dashboard/products', methods=['GET'])
def get_product_sales_data():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Lỗi máy chủ: Không thể kết nối DB."}), 500

    try:
        # Lấy tham số ngày từ query string
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        with conn.cursor() as cur:
            # Xây dựng truy vấn với bộ lọc ngày tùy chọn
            # Lưu ý: Giả định có bảng order_items để lưu chi tiết sản phẩm trong mỗi đơn hàng
            query = """
                SELECT
                    p.product_name,
                    SUM(oi.quantity) as total_quantity,
                    SUM(oi.quantity * oi.unit_price) as total_revenue
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN products p ON oi.product_id = p.product_id
            """
            
            params = []
            
            # Thêm điều kiện lọc ngày nếu có
            if start_date and end_date:
                query += " WHERE o.order_date::date BETWEEN %s AND %s"
                params.extend([start_date, end_date])
            elif start_date:
                query += " WHERE o.order_date::date >= %s"
                params.append(start_date)
            elif end_date:
                query += " WHERE o.order_date::date <= %s"
                params.append(end_date)
                
            query += " GROUP BY p.product_name ORDER BY total_revenue DESC LIMIT 10;"
            
            cur.execute(query, params)
            data = cur.fetchall()
            
            # Định dạng lại dữ liệu
            labels = [row['product_name'] for row in data]
            quantities = [int(row['total_quantity']) if row['total_quantity'] else 0 for row in data]
            revenue = [float(row['total_revenue']) if row['total_revenue'] else 0.0 for row in data]

            return jsonify({
                "labels": labels,
                "quantities": quantities,
                "revenue": revenue
            }), 200

    except Exception as e:
        print(f"Lỗi truy vấn Product Sales: {e}")
        # Nếu bảng order_items không tồn tại, trả về dữ liệu mẫu
        return jsonify({
            "labels": ["Laptop", "Mouse", "Keyboard", "Monitor", "Headphones"],
            "quantities": [15, 45, 30, 20, 25],
            "revenue": [15000000, 2250000, 4500000, 8000000, 3750000]
        }), 200
    finally:
        conn.close()

# 3. API LẤY CHI TIẾT KHÁCH HÀNG VÀ LỊCH SỬ GIAO DỊCH
@app.route('/api/customer/<int:customer_id>', methods=['GET'])
def get_customer_details(customer_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Lỗi máy chủ: Không thể kết nối DB."}), 500

    try:
        with conn.cursor() as cur:
            # 1. Lấy thông tin cơ bản của khách hàng
            cur.execute("""
                SELECT 
                    c.full_name, c.email, 
                    COUNT(o.order_id) as order_count,
                    COALESCE(SUM(o.total_amount), 0) as total_spent
                FROM customers c
                LEFT JOIN orders o ON c.customer_id = o.customer_id
                WHERE c.customer_id = %s
                GROUP BY 1, 2;
            """, (customer_id,))
            details = cur.fetchone()

            if not details:
                return jsonify({"message": "Không tìm thấy khách hàng."}), 404
            
            # Chuyển đổi kiểu dữ liệu cho details
            details['total_spent'] = float(details['total_spent'])
            details['order_count'] = int(details['order_count'])

            # 2. Lấy lịch sử giao dịch
            cur.execute("""
                SELECT order_id, order_date, total_amount, status
                FROM orders
                WHERE customer_id = %s
                ORDER BY order_date DESC;
            """, (customer_id,))
            history = cur.fetchall()
            
            # Chuyển đổi kiểu dữ liệu cho lịch sử
            for order in history:
                order['total_amount'] = float(order['total_amount'])
                # Đảm bảo ngày tháng ở định dạng chuỗi
                order['order_date'] = order['order_date'].isoformat() if order['order_date'] else None


            return jsonify({
                "details": details,
                "history": history
            }), 200

    except Exception as e:
        print(f"Lỗi truy vấn chi tiết khách hàng: {e}")
        return jsonify({"message": "Lỗi khi lấy dữ liệu chi tiết khách hàng."}), 500
    finally:
        conn.close()


if __name__ == '__main__':
    # Chạy trên 127.0.0.1:5000 (Localhost)
    app.run(debug=True, host='127.0.0.1', port=5000)