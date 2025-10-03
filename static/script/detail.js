const API_BASE_URL = ''; // Use empty string for relative URLs since everything is on the same server

// ==========================================================
// 1. CHỨC NĂNG HỖ TRỢ VÀ XÁC THỰC
// ==========================================================

function getCustomerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function checkAuthentication() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        console.warn("Không tìm thấy token. Chuyển hướng về trang đăng nhập.");
        window.location.href = '/login';
        return null;
    }
    return token;
}

function handleLogout() {
    localStorage.removeItem('userToken');
    window.location.href = '/login';
}

function loadCustomerData() {
    const customerId = document.getElementById('customer-id').value;
    if (!customerId) {
        alert('Vui lòng nhập ID khách hàng');
        return;
    }
    
    // Update URL with customer ID
    const url = new URL(window.location);
    url.searchParams.set('id', customerId);
    window.history.pushState({}, '', url);
    
    // Load customer data
    initializeDetailPage();
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
             if (response.status === 401) {
                alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
                handleLogout(); 
                return null;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi lấy chi tiết khách hàng.');
        }

        return await response.json(); 

    } catch (error) {
        console.error('Fetch Customer Details Error:', error);
        document.getElementById('customer-details-section').innerHTML = `<p class="text-red-500">Đã xảy ra lỗi khi tải dữ liệu: ${error.message}</p>`;
        return null; 
    }
}

// ==========================================================
// 3. HIỂN THỊ DỮ LIỆU LÊN GIAO DIỆN
// ==========================================================

function renderCustomerDetails(data) {
    const { details, history } = data;
    
    // A. THÔNG TIN CƠ BẢN
    document.getElementById('customer-name').textContent = details.full_name || 'N/A';
    document.getElementById('customer-email').textContent = details.email || 'N/A';
    document.getElementById('customer-segment').textContent = details.segment || 'Thường';
    
    // Định dạng tiền tệ
    document.getElementById('total-spent').textContent = `${details.total_spent.toLocaleString('vi-VN')} VND`;
    document.getElementById('order-count').textContent = details.order_count.toLocaleString('vi-VN');

    // B. LỊCH SỬ GIAO DỊCH
    const historyBody = document.getElementById('transaction-history-body');
    historyBody.innerHTML = ''; 

    if (history && history.length > 0) {
        history.forEach(order => {
            const row = historyBody.insertRow();
            row.insertCell().textContent = order.order_id;
            
            // Xử lý ngày tháng
            const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString('vi-VN') : 'N/A';
            row.insertCell().textContent = orderDate;
            
            // Định dạng tiền tệ
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
    console.log('DEBUG: Current URL:', window.location.href);
    console.log('DEBUG: Customer ID from URL:', customerId);

    // Thêm chức năng Back (Quay lại) và Logout
    document.getElementById('back-button').addEventListener('click', () => {
        // Tùy chọn: Dùng history.back() hoặc trỏ về dashboard.html
        window.location.href = '/dashboard';
    });
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // If no customer ID in URL, use the default value from the input field
    let finalCustomerId = customerId;
    if (!customerId) {
        console.log('DEBUG: No customer ID found in URL, using default from input field');
        finalCustomerId = document.getElementById('customer-id').value;
        
        // Update URL with the default customer ID
        const url = new URL(window.location);
        url.searchParams.set('id', finalCustomerId);
        window.history.pushState({}, '', url);
    }
    
    // Hiển thị trạng thái tải
    document.getElementById('customer-details-section').innerHTML = '<p>Đang tải chi tiết khách hàng...</p>';


    const data = await fetchCustomerDetails(finalCustomerId, token);
    
    if (data) {
        // Sau khi tải thành công, reset nội dung và render
        renderCustomerDetails(data);
    }
}

// Khởi chạy khi tài liệu được tải xong
document.addEventListener('DOMContentLoaded', initializeDetailPage);
