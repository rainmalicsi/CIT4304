/**
 * Utility functions for managing data in the browser's Local Storage.
 * This simulates a database for the application.
 *
 * This version is corrected to include startDate and endDate for Gantt.html,
 * along with leaderId and memberIds for Members.html.
 */

// Function to load data from localStorage
function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Function to save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Global function to get and set the current user's role
function getUserRole() {
    return localStorage.getItem('userRole') || 'member'; // Default to member
}

function setUserRole(role) {
    localStorage.setItem('userRole', role);
}

// --- Demo Data Initialization ---

function initializeDemoData() {
    // Only initialize if 'members' data doesn't exist
    if (!localStorage.getItem('members')) {
        const demoMembers = [
            { id: 1, name: "Jeremiah Smith", role: "leader", avatarId: 8, avatarUrl: "https://i.pravatar.cc/100?img=8" },
            { id: 2, name: "Alice Johnson", role: "member", avatarId: 12, avatarUrl: "https://i.pravatar.cc/100?img=12" },
            { id: 3, name: "Bob Williams", role: "member", avatarId: 15, avatarUrl: "https://i.pravatar.cc/100?img=15" },
            { id: 4, name: "Charlie Brown", role: "member", avatarId: 20, avatarUrl: "https://i.pravatar.cc/100?img=20" }
        ];

        const demoProjects = [
            { id: 101, name: "Q4 Marketing Website", leaderId: 1, memberIds: [1, 2, 3], status: "Pending", startDate: "2025-11-05", endDate: "2025-11-15", progress: 65 },
            { id: 102, name: "Mobile App Redesign", leaderId: 1, memberIds: [1, 4], status: "Completed", progress: 100 },
            { id: 103, name: "Internal Tooling Update", leaderId: 2, memberIds: [2, 3, 4], status: "Overdue", progress: 30 }
        ];

        const demoTasks = [
            // Project 101 Tasks
            { id: 1, projectId: 101, title: "Design wireframes", assignedTo: "Alice Johnson", startDate: "2025-11-05", endDate: "2025-11-15", completed: true },
            { id: 2, projectId: 101, title: "Develop homepage component", assignedTo: "Jeremiah Smith", startDate: "2025-11-10", endDate: "2025-12-05", completed: false },
            { id: 3, projectId: 101, title: "Set up CMS integration", assignedTo: "Bob Williams", startDate: "2025-12-01", endDate: "2025-12-15", completed: false },
            // Project 102 Tasks
            { id: 4, projectId: 102, title: "Define feature list", assignedTo: "Charlie Brown", startDate: "2025-12-05", endDate: "2025-12-15", completed: false },
            { id: 5, projectId: 102, title: "Research native frameworks", assignedTo: "Dana Scully", startDate: "2025-12-10", endDate: "2025-12-20", completed: false }
        ];

        // --- NEW CHAT MESSAGE DATA ---
        const demoChatMessages = [
            { id: 1001, senderId: 2, text: "Good morning team! Has anyone started reviewing the wireframes for the Q4 website?", timestamp: "2025-11-10T09:00:00.000Z" },
            { id: 1002, senderId: 1, text: "Morning Alice! I just finished my review. Looks great, just a few minor comments on the footer spacing.", timestamp: "2025-11-10T09:05:00.000Z" },
            { id: 1003, senderId: 3, text: "I'll take a look this afternoon. Should we set up a quick 15-min sync to walk through all feedback?", timestamp: "2025-11-10T09:15:00.000Z" },
            { id: 1004, senderId: 1, text: "Sounds good, Bob. I'll send out a calendar invite for 2 PM.", timestamp: "2025-11-10T09:16:00.000Z" },
            { id: 1005, senderId: 4, text: "Anyone working on the mobile app? I need clarification on the new login flow.", timestamp: "2025-11-10T10:30:00.000Z" }
        ];
        // --- END NEW CHAT MESSAGE DATA ---


        // Current User Setup (Set as Leader by default)
        const currentUser = {
            id: demoMembers[0].id,
            name: demoMembers[0].name,
            role: demoMembers[0].role,
            avatarUrl: demoMembers[0].avatarUrl,
            email: "jeremiah.smith@weekly.com"
        };

        // Save all data to localStorage
        saveData('members', demoMembers);
        saveData('projects', demoProjects);
        saveData('tasks', demoTasks);
        saveData('currentUser', currentUser);
        setUserRole(currentUser.role);
        // Save new chat messages
        saveData('chatMessages', demoChatMessages);
    }
}

initializeDemoData();