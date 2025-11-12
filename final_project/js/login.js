// Login handler - uses LOGIN_CREDENTIALS from appState.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Handle login button click
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            handleLogin();
        });
    }

    // Allow Enter key to submit
    if (usernameInput && passwordInput) {
        [usernameInput, passwordInput].forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        });
    }

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Clear previous error messages
        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
        }

        // Validate credentials
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        let validUser = null;

        // Check against all credentials in LOGIN_CREDENTIALS from appState.js
        for (const key in LOGIN_CREDENTIALS) {
            const credential = LOGIN_CREDENTIALS[key];
            if (credential.username === username && credential.password === password) {
                validUser = credential;
                break;
            }
        }

        if (validUser) {
            // Set the user role in AppState
            AppState.currentUser.role = validUser.role;
            AppState.currentUser.name = validUser.memberName || validUser.username;
            AppState.currentUser.id = validUser.memberId || (validUser.role === 'leader' ? 'leader1' : 'member1');
            
            // Save to localStorage
            localStorage.setItem('currentUserRole', validUser.role);
            localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));

            // Initialize AppState data on successful login
            loadData();

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            showError('Invalid username or password. Please try again.');
            passwordInput.value = '';
        }
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
});
