// Application State - Shared across all pages
const AppState = {
    projects: [],
    tasks: [],
    teamMembers: [],
    chatMessages: [],
    currentDate: new Date(),
    currentFilter: 'all',
    currentUser: {
        role: null, // 'leader' or 'member'
        id: null,
        name: null,
        email: null,
        avatarUrl: null
    }
};

// Login Credentials - Maps usernames to passwords and member info
const LOGIN_CREDENTIALS = {
    jeremiah: {
        username: 'jeremiah',
        password: 'smith123',
        role: 'leader',
        memberId: 1,
        memberName: 'Jeremiah Smith'
    },
    alice: {
        username: 'alice',
        password: 'johnson123',
        role: 'member',
        memberId: 2,
        memberName: 'Alice Johnson'
    },
    bob: {
        username: 'bob',
        password: 'williams123',
        role: 'member',
        memberId: 3,
        memberName: 'Bob Williams'
    },
    charlie: {
        username: 'charlie',
        password: 'brown123',
        role: 'member',
        memberId: 4,
        memberName: 'Charlie Brown'
    },
    // Legacy credentials
    leader: {
        username: 'leader',
        password: '5678',
        role: 'leader'
    },
    member: {
        username: 'member',
        password: '1234',
        role: 'member'
    }
};

// Load data from localStorage
function loadData() {
    // Try to load from the new localStorage keys first (members, projects, tasks)
    const savedMembers = localStorage.getItem('members');
    const savedProjects = localStorage.getItem('projects');
    const savedTasks = localStorage.getItem('tasks');
    const savedChat = localStorage.getItem('chatMessages');

    if (savedMembers) {
        AppState.teamMembers = JSON.parse(savedMembers);
    } else {
        // Initialize with demo data
        AppState.teamMembers = [
            { id: 1, name: "Jeremiah Smith", role: "leader", avatarId: 8, avatarUrl: "https://i.pravatar.cc/100?img=8", email: "jeremiah.smith@weekly.com" },
            { id: 2, name: "Alice Johnson", role: "member", avatarId: 12, avatarUrl: "https://i.pravatar.cc/100?img=12", email: "alice.johnson@weekly.com" },
            { id: 3, name: "Bob Williams", role: "member", avatarId: 15, avatarUrl: "https://i.pravatar.cc/100?img=15", email: "bob.williams@weekly.com" },
            { id: 4, name: "Charlie Brown", role: "member", avatarId: 20, avatarUrl: "https://i.pravatar.cc/100?img=20", email: "charlie.brown@weekly.com" }
        ];
    }

    if (savedProjects) {
        AppState.projects = JSON.parse(savedProjects);
    } else {
        // Initialize with demo data
        AppState.projects = [
            { id: 101, name: "Q4 Marketing Website", leaderId: 1, memberIds: [1, 2, 3], status: "Pending", startDate: "2025-11-05", endDate: "2025-11-15", progress: 65 },
            { id: 102, name: "Mobile App Redesign", leaderId: 1, memberIds: [1, 4], status: "Completed", progress: 100 },
            { id: 103, name: "Internal Tooling Update", leaderId: 1, memberIds: [2, 3, 4], status: "Overdue", progress: 30 }
        ];
    }

    if (savedTasks) {
        AppState.tasks = JSON.parse(savedTasks);
    } else {
        // Initialize with demo data
        AppState.tasks = [
            // Project 101 Tasks
            { id: 1, projectId: 101, title: "Design wireframes", name: "Design wireframes", assignedTo: "Alice Johnson", assigneeId: 2, startDate: "2025-11-05", endDate: "2025-11-15", dueDate: "2025-11-15", status: "completed", completed: true },
            { id: 2, projectId: 101, title: "Develop homepage component", name: "Develop homepage component", assignedTo: "Jeremiah Smith", assigneeId: 1, startDate: "2025-11-10", endDate: "2025-12-05", dueDate: "2025-12-05", status: "in-progress", completed: false },
            { id: 3, projectId: 101, title: "Set up CMS integration", name: "Set up CMS integration", assignedTo: "Bob Williams", assigneeId: 3, startDate: "2025-12-01", endDate: "2025-12-15", dueDate: "2025-12-15", status: "pending", completed: false },
            // Project 102 Tasks
            { id: 4, projectId: 102, title: "Define feature list", name: "Define feature list", assignedTo: "Charlie Brown", assigneeId: 4, startDate: "2025-12-05", endDate: "2025-12-15", dueDate: "2025-12-15", status: "completed", completed: true },
            { id: 5, projectId: 102, title: "Research native frameworks", name: "Research native frameworks", assignedTo: "Alice Johnson", assigneeId: 2, startDate: "2025-12-10", endDate: "2025-12-20", dueDate: "2025-12-20", status: "pending", completed: false }
        ];
    }

    if (savedChat) {
        AppState.chatMessages = JSON.parse(savedChat);
    } else {
        // Initialize with demo chat messages
        AppState.chatMessages = [
            { id: 1001, senderId: 2, text: "Good morning team! Has anyone started reviewing the wireframes for the Q4 website?", timestamp: "2025-11-10T09:00:00.000Z" },
            { id: 1002, senderId: 1, text: "Morning Alice! I just finished my review. Looks great, just a few minor comments on the footer spacing.", timestamp: "2025-11-10T09:05:00.000Z" },
            { id: 1003, senderId: 3, text: "I'll take a look this afternoon. Should we set up a quick 15-min sync to walk through all feedback?", timestamp: "2025-11-10T09:15:00.000Z" },
            { id: 1004, senderId: 1, text: "Sounds good, Bob. I'll send out a calendar invite for 2 PM.", timestamp: "2025-11-10T09:16:00.000Z" },
            { id: 1005, senderId: 4, text: "Anyone working on the mobile app? I need clarification on the new login flow.", timestamp: "2025-11-10T10:30:00.000Z" }
        ];
    }

    // Restore persisted current user (if any) so AppState.currentUser is available after page reloads
    const savedCurrentUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('currentUserRole');
    if (savedCurrentUser) {
        try {
            AppState.currentUser = JSON.parse(savedCurrentUser);
        } catch (e) {
            // ignore parse errors
        }
    } else if (savedRole) {
        AppState.currentUser.role = savedRole;
    }

    saveData();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('projects', JSON.stringify(AppState.projects));
    localStorage.setItem('tasks', JSON.stringify(AppState.tasks));
    localStorage.setItem('members', JSON.stringify(AppState.teamMembers));
    localStorage.setItem('chatMessages', JSON.stringify(AppState.chatMessages));
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
