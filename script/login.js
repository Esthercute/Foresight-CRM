// File: login_script.js (Cập nhật)

const API_BASE_URL = 'https://friendly-memory-946px466vxr374pg-5000.app.github.dev/'; // Địa chỉ của Flask server

function handleLogin(event) {
    event.preventDefault(); 

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert("Please enter your username and password.");
        return false;
    }
    
    // Gửi yêu cầu đăng nhập đến API Back-end
    fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            username: document.getElementById('username').value, 
            password: document.getElementById('password').value 
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Login failed.'); });
        }
        return response.json();
    })
    .then(data => {
        alert(`Welcome, ${data.full_name}! Redirecting to Dashboard...`);
        localStorage.setItem('userToken', data.token); 
        window.location.href = "dashboard.html"; 
    })
    .catch(error => {
        alert(`Login failed: ${error.message}`);
        console.error('Login error:', error);
    });

    return false;
}