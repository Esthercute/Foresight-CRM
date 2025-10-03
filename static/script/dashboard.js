const API_BASE_URL = ''; // Use empty string for relative URLs since everything is on the same server

// ==========================================================
// 1. CHỨC NĂNG XÁC MINH VÀ CHUYỂN HƯỚNG
// ==========================================================

function checkAuthentication() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        // Nếu không có token, chuyển hướng về trang đăng nhập
        console.warn("Không tìm thấy token. Chuyển hướng về trang đăng nhập.");
        window.location.href = '/login';
        return false;
    }
    return token;
}

function handleLogout() {
    localStorage.removeItem('userToken');
    window.location.href = '/login';
}

// ==========================================================
// 2. GỌI API VÀ LẤY DỮ LIỆU DASHBOARD
// ==========================================================

async function fetchDashboardData(token, startDate = null, endDate = null) {
    try {
        // Thêm tham số ngày vào URL nếu có
        let url = `${API_BASE_URL}/api/dashboard/revenue`;
        if (startDate && endDate) {
            url += `?start_date=${startDate}&end_date=${endDate}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Gửi token (Nếu API yêu cầu xác thực bằng token)
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            // Nếu lỗi 401 (Unauthorized), phiên làm việc hết hạn
            if (response.status === 401) {
                alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
                handleLogout(); 
                return null;
            }
            throw new Error(errorData.message || 'Lỗi khi lấy dữ liệu Dashboard.');
        }

        return await response.json(); 

    } catch (error) {
        console.error('Fetch Dashboard Error:', error);
        document.querySelector('.chart-container').innerHTML = `<p class="text-red-500">Lỗi kết nối hoặc dữ liệu: ${error.message}</p>`;
        return null; 
    }
}

async function fetchProductSalesData(token, startDate = null, endDate = null) {
    try {
        // Thêm tham số ngày vào URL nếu có
        let url = `${API_BASE_URL}/api/dashboard/products`;
        if (startDate && endDate) {
            url += `?start_date=${startDate}&end_date=${endDate}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Gửi token (Nếu API yêu cầu xác thực bằng token)
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            // Nếu lỗi 401 (Unauthorized), phiên làm việc hết hạn
            if (response.status === 401) {
                alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
                handleLogout();
                return null;
            }
            throw new Error(errorData.message || 'Lỗi khi lấy dữ liệu sản phẩm.');
        }

        return await response.json();

    } catch (error) {
        console.error('Fetch Product Sales Error:', error);
        document.querySelectorAll('.chart-container')[1].innerHTML = `<p class="text-red-500">Lỗi kết nối hoặc dữ liệu: ${error.message}</p>`;
        return null;
    }
}

// ==========================================================
// 3. VẼ BIỂU ĐỒ (Sử dụng Chart.js)
// ==========================================================

function renderRevenueChart(data) {
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.innerHTML = '<canvas id="revenueChart"></canvas>';
    
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar', // Loại biểu đồ: thanh
        data: {
            labels: data.labels, // Ví dụ: ["2024-01", "2024-02", ...]
            datasets: [{
                label: 'Tổng Doanh Thu (VND)',
                data: data.revenue, // Ví dụ: [15000000, 22000000, ...]
                backgroundColor: 'rgba(59, 130, 246, 0.7)', // Màu xanh Tailwind
                borderColor: 'rgba(29, 78, 216, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Doanh Thu'
                    },
                    // Định dạng tiền tệ cho trục Y
                    ticks: {
                        callback: function(value, index, values) {
                            return value.toLocaleString('vi-VN') + ' VNĐ';
                        }
                    }
                }
            }
        }
    });
}

function renderProductSalesChart(data) {
    const chartContainer = document.querySelectorAll('.chart-container')[1];
    chartContainer.innerHTML = '<canvas id="salesChart"></canvas>';
    
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut', // Loại biểu đồ: hình tròn
        data: {
            labels: data.labels, // Ví dụ: ["Laptop", "Mouse", ...]
            datasets: [{
                label: 'Doanh Thu (VND)',
                data: data.revenue, // Ví dụ: [15000000, 2200000, ...]
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)',
                    'rgba(83, 102, 255, 0.7)',
                    'rgba(255, 99, 255, 0.7)',
                    'rgba(99, 255, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(255, 99, 255, 1)',
                    'rgba(99, 255, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.toLocaleString('vi-VN') + ' VNĐ';
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function updateDashboard() {
    const token = checkAuthentication();
    if (!token) return;
    
    // Lấy ngày bắt đầu và kết thúc
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    // Hiển thị trạng thái tải
    document.querySelectorAll('.chart-container').forEach(container => {
        container.innerHTML = '<p>Đang tải dữ liệu...</p>';
    });
    
    // Gọi API với khoảng ngày đã chọn
    Promise.all([
        fetchDashboardData(token, startDate, endDate),
        fetchProductSalesData(token, startDate, endDate)
    ]).then(results => {
        const [revenueData, productData] = results;
        
        // Cập nhật biểu đồ doanh thu
        if (revenueData && revenueData.labels && revenueData.labels.length > 0) {
            renderRevenueChart(revenueData);
        } else if (revenueData) {
            document.querySelector('.chart-container').innerHTML = '<p>Không tìm thấy dữ liệu doanh thu trong khoảng thời gian đã chọn.</p>';
        }
        
        // Cập nhật biểu đồ sản phẩm
        if (productData && productData.labels && productData.labels.length > 0) {
            renderProductSalesChart(productData);
        } else if (productData) {
            document.querySelectorAll('.chart-container')[1].innerHTML = '<p>Không tìm thấy dữ liệu sản phẩm trong khoảng thời gian đã chọn.</p>';
        }
    });
}

// ==========================================================
// HÀM KHỞI TẠO CHÍNH
// ==========================================================

async function initializeDashboard() {
    const token = checkAuthentication();
    if (!token) return;

    // Thiết lập nút Đăng xuất
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    
    // Thiết lập nút Cập nhật Dashboard
    document.getElementById('update-dashboard-button').addEventListener('click', updateDashboard);

    // Hiển thị trạng thái tải
    document.querySelectorAll('.chart-container').forEach(container => {
        container.innerHTML = '<p>Đang tải dữ liệu...</p>';
    });

    // Lấy dữ liệu
    const [revenueData, productData] = await Promise.all([
        fetchDashboardData(token),
        fetchProductSalesData(token)
    ]);
    
    // Cập nhật biểu đồ doanh thu
    if (revenueData && revenueData.labels && revenueData.labels.length > 0) {
        renderRevenueChart(revenueData);
    } else if (revenueData) {
        document.querySelector('.chart-container').innerHTML = '<p>Không tìm thấy dữ liệu doanh thu.</p>';
    }
    
    // Cập nhật biểu đồ sản phẩm
    if (productData && productData.labels && productData.labels.length > 0) {
        renderProductSalesChart(productData);
    } else if (productData) {
        document.querySelectorAll('.chart-container')[1].innerHTML = '<p>Không tìm thấy dữ liệu sản phẩm.</p>';
    }
}

// Khởi chạy khi tài liệu được tải xong
document.addEventListener('DOMContentLoaded', initializeDashboard);
