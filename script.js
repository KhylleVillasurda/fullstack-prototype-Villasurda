let currentUser = null;
let employees = [];
let departments = [];

function loadData() {
    employees = JSON.parse(localStorage.getItem("employees")) || [];
    departments = JSON.parse(localStorage.getItem("departments")) || [];
}

function saveEmployees() {
    localStorage.setItem("employees", JSON.stringify(employees));
}

function saveDepartments() {
    localStorage.setItem("departments", JSON.stringify(departments))
}

// ========== PAGE NAVIGATION ========== //
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const pageElement = document.getElementById(pageName + 'Page');
    if (pageElement) {
        pageElement.classList.add('active');
        window.location.hash = pageName;
        
        // Update profile email if on profile page
        if (pageName === 'profile' && currentUser) {
            const profileEmail = document.getElementById('profileEmail');
            if (profileEmail) {
                profileEmail.textContent = currentUser.email;
            }
        }
        
        // Close mobile menu if open
        const navbarCollapse = document.getElementById('navbarNav');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
        }
    }
}

// ========== AUTHENTICATION HANDKERS ========== //

function setAuthState(user = null) {
    const body = document.body;
    
    // Remove existing auth classes
    body.classList.remove('authenticated', 'not-authenticated');
    
    if (user) {
        // User is logged in
        body.classList.add('authenticated');
        currentUser = user;
        
        // If on login or register page, redirect to landing
        const currentPage = window.location.hash.substring(1);
        if (currentPage === 'login' || currentPage === 'register') {
            showPage('landing');
        }
    } else {
        // User is logged out
        body.classList.add('not-authenticated');
        currentUser = null;
        
        // If on protected pages, redirect to landing
        const currentPage = window.location.hash.substring(1);
        const protectedPages = ['profile', 'employees', 'accounts', 'departments', 'requests'];
        if (protectedPages.includes(currentPage)) {
            showPage('landing');
        }
    }
}

// ========== REGISTER HANDLER ========== //

function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('fname').value;
    const lastName = document.getElementById('lname').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (firstName && lastName && email && password) {
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // Fixed: changed 'user' to 'users'
        if (users.some(u => u.email === email)) {
            alert("Email already registered! Please use a different email.");
            return;
        } 
        
        const newUser = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            verified: false
        };
        
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        sessionStorage.setItem("pendingVerification", email);
        alert("Registration successful! Please check your email for verification.");
        showPage("verify");

        const verifyEmail = document.getElementById("verifyEmail");
        if (verifyEmail) {
            verifyEmail.textContent = email;
        }

        // Fixed: Added parentheses to reset()
        document.getElementById("registerForm").reset();
        
    } else {
        // This else was misplaced - it was inside the if block
        alert("Please fill in all fields");
    }
}

// ========== LOGIN HANDLER ========== //

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('pwd').value;
    
    if (email && password) {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user with matching email and password
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Check if verified
            if (!user.verified) {
                alert('Please verify your email first!');
                sessionStorage.setItem('pendingVerification', email);
                showPage('verify');
                return;
            }
            
            // Set auth state
            setAuthState(user);
            alert('Login successful! Welcome ' + user.firstName);
            
            // Clear form
            document.getElementById('loginForm').reset();
        } else {
            alert('Invalid email or password!');
        }
    } else {
        alert('Please fill in all fields');
    }
}

// ========== LOGOUT HANDLER ========== //

function logout() {
    setAuthState(null);
    alert("Logged out successfully!");
    showPage("landing");
}

// ========== SIMULATE VERIFICATION ========== //

function simulateVerification() {
    const email = sessionStorage.getItem("pendingVerification");

    if (email) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.email === email);
        if (user) {
            user.verified = true;
            localStorage.setItem("users", JSON.stringify(users));
    }
        sessionStorage.removeItem("pendingVerification");
        alert("Email Verified! You can now log in.");
        showPage("login");
    } else {
        alert("No pending verification found. Please register first.");
        showPage("register");
    }
}

// ========== INITIALIZATION ========== //

// Checks if there's a hash in the URL when page loads
window.addEventListener('load', () => {
    console.log("Window loaded - initializing app");
    loadData(); 
    setAuthState(null);
    
    // Check if setupEventListeners exists before calling
    if (typeof setupEventListeners === 'function') {
        setupEventListeners();
    }
    
    const hash = window.location.hash.substring(1);
    if (hash) {
        showPage(hash);
    }
});