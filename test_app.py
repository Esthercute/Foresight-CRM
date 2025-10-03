import os
import hashlib
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS 

app = Flask(__name__)
CORS(app) 

# Test route for login page
@app.route('/login')
def login_page():
    """Serve the login page"""
    return render_template('login.html')

# Test API route that doesn't require database
@app.route('/api/login', methods=['POST'])
def login():
    print("Login endpoint called")  # Debug line
    data = request.get_json()
    print(f"Received data: {data}")  # Debug line
    
    if not data:
        return jsonify({"message": "No JSON data received."}), 400
        
    username = data.get('username')
    password = data.get('password')
    print(f"Extracted username: {username}, password: {password}")  # Debug line

    if not username or not password:
        return jsonify({"message": "Vui lòng cung cấp đầy đủ thông tin."}), 400

    # Simple test authentication (accept any non-empty credentials)
    if username and password:
        return jsonify({
            "message": "Đăng nhập thành công!",
            "user_id": 1,
            "full_name": username,
            "token": "fake_jwt_token_1"
        }), 200
    else:
        return jsonify({"message": "Tên người dùng hoặc mật khẩu không đúng."}), 401

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)