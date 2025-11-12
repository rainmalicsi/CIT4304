// Helper Functions

// Format date string to readable format
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Calculate duration between two dates in days
function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
}

// Render member checkboxes in a container
function renderMemberCheckboxes(containerId, selectedIds = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = AppState.teamMembers.map(member => `
        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input type="checkbox" value="${member.id}" ${selectedIds.includes(member.id) ? 'checked' : ''}>
            <span>${member.name} (${member.role})</span>
        </label>
    `).join('');
}

// Initialize navigation between pages
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            navigateToPage(page);
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Navigate to different pages (redirects to separate HTML files)
function navigateToPage(pageName) {
    const pageMap = {
        'dashboard': 'dashboard.html',
        'projects': 'projects.html',
        'tasks': 'tasks.html',
        'calendar': 'calendar.html',
        'gantt': 'gantt.html',
        'team': 'team.html',
        'my-tasks': 'my-tasks.html',
        'my-progress': 'my-progress.html'
    };
    
    if (pageMap[pageName]) {
        window.location.href = pageMap[pageName];
    }
}

// Initialize modals
function initializeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Update the sidebar profile name and avatar using AppState.currentUser
function updateSidebarProfile() {
    try {
        // Ensure AppState has been loaded
        if (typeof loadData === 'function') loadData();
    } catch (e) {
        // ignore if loadData not available
    }

    const sidebarProfileImg = document.getElementById('sidebarProfileImg');
    const sidebarProfileText = document.getElementById('sidebarProfileText');
    const DEFAULT_AVATAR = 'https://i.pravatar.cc/100?img=8';

    let user = AppState && AppState.currentUser ? AppState.currentUser : null;

    // If currentUser is not set in AppState, try localStorage fallback
    if ((!user || !user.name) && localStorage.getItem('currentUser')) {
        try {
            user = JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            user = user || null;
        }
    }

    if (sidebarProfileImg) {
        sidebarProfileImg.src = (user && user.avatarUrl) ? user.avatarUrl : DEFAULT_AVATAR;
    }
    if (sidebarProfileText) {
        sidebarProfileText.textContent = (user && user.name) ? user.name : 'My Profile';
    }
}

// Auto-run on page load so sidebar shows correct name across pages
document.addEventListener('DOMContentLoaded', () => {
    updateSidebarProfile();
});

// Format date for input fields
function getToday() {
    return new Date().toISOString().split('T')[0];
}
