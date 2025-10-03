// File: js/login.js

// API Base URL cho môi trường LOCALHOST/DBngin
const API_BASE_URL = ''; // Use empty string for relative URLs since everything is on the same server

// ==========================================================
// HÀM XỬ LÝ ĐĂNG NHẬP
// ==========================================================

async function handleLogin(event) {
    // Ngăn chặn sự kiện submit form mặc định (tránh tải lại trang)
    event.preventDefault();

    // Lấy các element form
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('login-message');
    const submitButton = document.querySelector('button[type="submit"]');

    messageElement.textContent = ''; // Xóa thông báo cũ
    messageElement.className = 'text-center mt-3';

    if (!email || !password) {
        messageElement.textContent = 'Vui lòng điền đầy đủ email và mật khẩu.';
        messageElement.classList.add('text-red-500');
        return;
    }
    
    // Vô hiệu hóa nút và hiển thị trạng thái đang tải
    submitButton.disabled = true;
    submitButton.textContent = 'Đang đăng nhập...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            // Đăng nhập thành công (HTTP 200)
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userName', data.full_name); 

            messageElement.textContent = 'Đăng nhập thành công! Đang chuyển hướng...';
            messageElement.classList.add('text-green-500');

            // Chuyển hướng đến trang dashboard chính (dashboard.html hoặc index.html)
            window.location.href = '/dashboard';

        } else {
            // Lỗi xác thực (ví dụ: HTTP 401)
            messageElement.textContent = data.message || 'Lỗi đăng nhập không xác định.';
            messageElement.classList.add('text-red-500');
        }

    } catch (error) {
        console.error('Lỗi kết nối API:', error);
        messageElement.textContent = 'Lỗi kết nối đến máy chủ API. Vui lòng kiểm tra Flask Server.';
        messageElement.classList.add('text-red-500');

    } finally {
        // Kích hoạt lại nút
        submitButton.disabled = false;
        submitButton.textContent = 'Đăng nhập';
    }
}

// ==========================================================
// KHỞI TẠO: Gắn hàm xử lý vào form submit
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra nếu đã có token, chuyển hướng thẳng (tránh đăng nhập lại)
    if (localStorage.getItem('userToken')) {
        console.log("Đã có token, chuyển hướng đến Dashboard.");
        window.location.href = '/dashboard';
        return;
    }

    // 2. Gắn sự kiện submit cho form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Không tìm thấy element có ID là "login-form".');
    }
});
