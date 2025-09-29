function handleLogin(event) {
    event.preventDefault(); 

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        alert(`Logged in with account: ${username}. Redirect to Dashboard...`);
        window.location.href = "dashboard.html"; 
    } else {
        alert("Please enter user name and password.");
    }
    return false;
}