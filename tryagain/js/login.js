// Login credentials are loaded from localStorage.js
// They include: jeremiah, alice, bob, charlie, leader, member

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

        // Check against login credentials from localStorage.js
        for (const key in LOGIN_CREDENTIALS) {
            const cred = LOGIN_CREDENTIALS[key];
            if (cred.username === username && cred.password === password) {
                validUser = cred;
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
