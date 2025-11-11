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
    const savedMembers = localStorage.getItem('members');

    if (savedProjects) {
        AppState.projects = JSON.parse(savedProjects);
    } else {
        // Sample data
        AppState.projects = [
            {
                id: 101,
                name: 'Q4 Marketing Website',
                description: 'Complete redesign of company website',
                startDate: '2025-11-05',
                endDate: '2025-11-15',
                status: 'active',
                leaderId: 1,
                memberIds: [1, 2, 3],
                progress: 65
            },
            {
                id: 102,
                name: 'Mobile App Redesign',
                startDate: '2025-11-01',
                endDate: '2025-11-20',
                status: 'active',
                leaderId: 1,
                memberIds: [1, 4],
                progress: 100
            }
        ];
    }

    if (savedTasks) {
        AppState.tasks = JSON.parse(savedTasks);
    } else {
        AppState.tasks = [
            {
                id: 1,
                projectId: 101,
                title: 'Design wireframes',
                name: 'Design wireframes',
                description: 'Create initial design wireframes',
                startDate: '2025-11-05',
                dueDate: '2025-11-10',
                endDate: '2025-11-10',
                status: 'completed',
                completed: true,
                assigneeId: 2,
                priority: 'high'
            },
            {
                id: 2,
                projectId: 101,
                title: 'Develop homepage component',
                name: 'Develop homepage component',
                description: 'Build responsive homepage component',
                startDate: '2025-11-10',
                dueDate: '2025-11-15',
                endDate: '2025-11-15',
                status: 'in-progress',
                completed: false,
                assigneeId: 1,
                priority: 'high'
            },
            {
                id: 3,
                projectId: 101,
                title: 'Set up CMS integration',
                name: 'Set up CMS integration',
                description: 'Integrate with CMS system',
                startDate: '2025-11-12',
                dueDate: '2025-11-18',
                endDate: '2025-11-18',
                status: 'pending',
                completed: false,
                assigneeId: 3,
                priority: 'medium'
            },
            {
                id: 4,
                projectId: 102,
                title: 'Define feature list',
                name: 'Define feature list',
                description: 'Define app features',
                startDate: '2025-11-08',
                dueDate: '2025-11-12',
                endDate: '2025-11-12',
                status: 'completed',
                completed: true,
                assigneeId: 4,
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
                name: 'Jeremiah Smith',
                email: 'jeremiah.smith@weekly.com',
                role: 'leader',
                avatarId: 8,
                avatarUrl: 'https://i.pravatar.cc/100?img=8'
            },
            {
                id: 2,
                name: 'Alice Johnson',
                email: 'alice.johnson@weekly.com',
                role: 'member',
                avatarId: 12,
                avatarUrl: 'https://i.pravatar.cc/100?img=12'
            },
            {
                id: 3,
                name: 'Bob Williams',
                email: 'bob.williams@weekly.com',
                role: 'member',
                avatarId: 15,
                avatarUrl: 'https://i.pravatar.cc/100?img=15'
            },
            {
                id: 4,
                name: 'Charlie Brown',
                email: 'charlie.brown@weekly.com',
                role: 'member',
                avatarId: 20,
                avatarUrl: 'https://i.pravatar.cc/100?img=20'
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
