// Handle registration form submission
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    if (!username || !email || !password) {
        messageDiv.innerHTML = '<div class="alert alert-warning">Please fill all fields.</div>';
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const result = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = '<div class="alert alert-success">Registration successful! Awaiting admin approval. Redirecting to login...</div>';
            setTimeout(() => window.location.href = '/login', 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.error}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = '<div class="alert alert-danger">An error occurred. Please try again.</div>';
    }
});

// Handle farmer login form submission
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    if (!email || !password) {
        messageDiv.innerHTML = '<div class="alert alert-warning">Please fill all fields.</div>';
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
            setTimeout(() => window.location.href = '/dashboard', 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.error}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = '<div class="alert alert-danger">An error occurred. Please try again.</div>';
    }
});

// Handle admin login form submission
document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    if (!username || !password) {
        messageDiv.innerHTML = '<div class="alert alert-warning">Please fill all fields.</div>';
        return;
    }

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
            setTimeout(() => window.location.href = '/admin', 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.error}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = '<div class="alert alert-danger">An error occurred. Please try again.</div>';
    }
});

// Handle logout
document.querySelectorAll('.btn-secondary')?.forEach(button => {
    button.addEventListener('click', () => {
        document.cookie = 'token=; Max-Age=0; path=/';
        window.location.href = '/';
    });
});