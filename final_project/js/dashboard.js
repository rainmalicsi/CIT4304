// Dashboard Page Logic

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Check if user is logged in
    if (!checkUserRole()) {
        window.location.href = 'login.html';
        return;
    }
    
    applyRoleUI(AppState.currentUser.role);
    initializeNavigation();
    updateDashboard();
    
    // Switch role button
    document.getElementById('switchRoleBtn')?.addEventListener('click', () => {
        localStorage.removeItem('currentUserRole');
        window.location.href = 'login.html';
    });
});

// Update dashboard with data
function updateDashboard() {
    const totalProjects = AppState.projects.length;
    const completedTasks = AppState.tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = AppState.tasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = AppState.tasks.filter(t => {
        if (t.status === 'completed') return false;
        return new Date(t.dueDate) < new Date();
    }).length;

    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('inProgressTasks').textContent = inProgressTasks;
    document.getElementById('overdueTasks').textContent = overdueTasks;

    renderRecentProjects();
    renderUpcomingDeadlines();
}

// Render recent projects
function renderRecentProjects() {
    const container = document.getElementById('recentProjects');
    const recent = AppState.projects.slice(0, 5);
    
    container.innerHTML = recent.length > 0 
        ? recent.map(p => `
            <div class="list-item">
                <div>
                    <div class="list-item-title">${p.name}</div>
                    <div class="list-item-meta">${p.status}</div>
                </div>
            </div>
        `).join('')
        : '<p style="color: var(--text-secondary);">No projects yet</p>';
}

// Render upcoming deadlines
function renderUpcomingDeadlines() {
    const container = document.getElementById('upcomingDeadlines');
    const upcoming = AppState.tasks
        .filter(t => t.status !== 'completed' && new Date(t.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
    
    container.innerHTML = upcoming.length > 0
        ? upcoming.map(t => {
            const project = AppState.projects.find(p => p.id === t.projectId);
            return `
                <div class="list-item">
                    <div>
                        <div class="list-item-title">${t.name}</div>
                        <div class="list-item-meta">${project?.name || 'No Project'} • ${formatDate(t.dueDate)}</div>
                    </div>
                </div>
            `;
        }).join('')
        : '<p style="color: var(--text-secondary);">No upcoming deadlines</p>';
}
