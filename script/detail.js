// File: js/detail.js

// Lấy URL API chuyển tiếp cổng 5000 (QUAN TRỌNG: Thay thế bằng URL HTTPS thực tế của bạn)
const API_BASE_URL = 'https://[URL_CỦA_BẠN_TRÊN_CỔNG_5000]'; 

// ==========================================================
// 1. CHỨC NĂNG HỖ TRỢ (Lấy ID từ URL)
// ==========================================================

function getCustomerIdFromUrl() {
    // Ví dụ: Đọc ID từ URL: detail.html?id=123
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function checkAuthentication() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        // Nếu không có token, chuyển hướng về trang đăng nhập
        alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = 'login.html';
        return null;
    }
    return token;
}

// ==========================================================
// 2. GỌI API LẤY CHI TIẾT KHÁCH HÀNG
// ==========================================================

async function fetchCustomerDetails(customerId, token) {
    if (!customerId) {
        document.querySelector('.container').innerHTML = "<h2>Lỗi: Không tìm thấy ID khách hàng trong URL.</h2>";
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/customer/${customerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi lấy chi tiết khách hàng.');
        }

        return await response.json(); 

    } catch (error) {
        console.error('Fetch Customer Details Error:', error);
        alert(`Lỗi kết nối hoặc dữ liệu: ${error.message}`);
        document.querySelector('.container').innerHTML = "<h2>Đã xảy ra lỗi khi tải dữ liệu.</h2>";
        return null; 
    }
}

// ==========================================================
// 3. HIỂN THỊ DỮ LIỆU LÊN GIAO DIỆN
// ==========================================================

function renderCustomerDetails(data) {
    // --------------------------------------------------
    // A. THÔNG TIN CƠ BẢN
    // --------------------------------------------------
    
    // Giả sử bạn có các thẻ HTML với ID: customer-name, customer-email, customer-total-spent, v.v.
    document.getElementById('customer-name').textContent = data.details.full_name;
    document.getElementById('customer-email').textContent = data.details.email;
    document.getElementById('customer-segment').textContent = data.details.segment || 'VIP';
    document.getElementById('total-spent').textContent = `${data.details.total_spent.toLocaleString('vi-VN')} VND`;
    document.getElementById('order-count').textContent = data.details.order_count.toLocaleString('vi-VN');

    // --------------------------------------------------
    // B. LỊCH SỬ GIAO DỊCH
    // --------------------------------------------------
    const historyBody = document.getElementById('transaction-history-body');
    historyBody.innerHTML = ''; // Xóa dữ liệu cũ

    if (data.history && data.history.length > 0) {
        data.history.forEach(order => {
            const row = historyBody.insertRow();
            row.insertCell().textContent = order.order_id;
            row.insertCell().textContent = new Date(order.order_date).toLocaleDateString('vi-VN');
            row.insertCell().textContent = `${order.total_amount.toLocaleString('vi-VN')} VND`;
            row.insertCell().textContent = order.status;
        });
    } else {
        const row = historyBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = "Không có lịch sử giao dịch nào.";
    }
}


// ==========================================================
// HÀM KHỞI TẠO CHÍNH
// ==========================================================

async function initializeDetailPage() {
    const token = checkAuthentication();
    if (!token) return;

    const customerId = getCustomerIdFromUrl();

    const data = await fetchCustomerDetails(customerId, token);
    
    if (data) {
        renderCustomerDetails(data);
    }
    
    // Thêm chức năng Back (Quay lại)
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'dashboard.html'; // Hoặc index.html
    });
}

// Khởi chạy khi tài liệu được tải xong
document.addEventListener('DOMContentLoaded', initializeDetailPage);