// Application State - Shared across all pages
const AppState = {
    projects: [],
    tasks: [],
    teamMembers: [],
    currentDate: new Date(),
    currentFilter: 'all',
    currentUser: {
        role: null, // 'leader' or 'member'
        id: null,
        name: null
    }
};

// Load data from localStorage
function loadData() {
    const savedProjects = localStorage.getItem('projects');
    const savedTasks = localStorage.getItem('tasks');
    const savedMembers = localStorage.getItem('teamMembers');

    if (savedProjects) {
        AppState.projects = JSON.parse(savedProjects);
    } else {
        // Sample data
        AppState.projects = [
            {
                id: 1,
                name: 'Website Redesign',
                description: 'Complete redesign of company website',
                startDate: '2025-11-14',
                endDate: '2025-11-29',
                status: 'active',
                members: [1]
            }
        ];
    }

    if (savedTasks) {
        AppState.tasks = JSON.parse(savedTasks);
    } else {
        AppState.tasks = [
            {
                id: 1,
                name: 'Design Mockups',
                description: 'Create initial design mockups',
                projectId: 1,
                startDate: '2024-01-01',
                dueDate: '2024-01-15',
                status: 'completed',
                assigneeId: 1,
                priority: 'high'
            }
        ];
    }

    if (savedMembers) {
        AppState.teamMembers = JSON.parse(savedMembers);
    } else {
        AppState.teamMembers = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'designer'
            }
        ];
    }

    saveData();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('projects', JSON.stringify(AppState.projects));
    localStorage.setItem('tasks', JSON.stringify(AppState.tasks));
    localStorage.setItem('teamMembers', JSON.stringify(AppState.teamMembers));
}

// Check current user role from localStorage
function checkUserRole() {
    const savedRole = localStorage.getItem('currentUserRole');
    if (savedRole) {
        AppState.currentUser.role = savedRole;
        applyRoleUI(savedRole);
        return true;
    }
    return false;
}

// Apply role-based UI changes
function applyRoleUI(role) {
    document.body.className = `${role}-role`;
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    
    if (role === 'leader') {
        if (userName) userName.textContent = 'Team Leader';
        if (userRole) userRole.textContent = 'Project Manager';
    } else if (role === 'member') {
        if (userName) userName.textContent = 'Team Member';
        if (userRole) userRole.textContent = 'Team Member';
    }
}

// Set user role
function selectRole(role) {
    AppState.currentUser.role = role;
    localStorage.setItem('currentUserRole', role);
    
    // Set member ID if member role
    if (role === 'member') {
        if (AppState.teamMembers.length > 0) {
            AppState.currentUser.id = AppState.teamMembers[0].id;
            AppState.currentUser.name = AppState.teamMembers[0].name;
        } else {
            const defaultMember = {
                id: 1,
                name: 'Team Member',
                email: 'member@example.com',
                role: 'developer'
            };
            AppState.teamMembers.push(defaultMember);
            AppState.currentUser.id = defaultMember.id;
            AppState.currentUser.name = defaultMember.name;
            saveData();
        }
    } else {
        AppState.currentUser.id = null;
        AppState.currentUser.name = null;
    }
    
    applyRoleUI(role);
}
