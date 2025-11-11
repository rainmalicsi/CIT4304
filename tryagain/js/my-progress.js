// My Progress Page Logic (Member Only)

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Check if user is logged in
    if (!checkUserRole()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Redirect if not a member
    if (AppState.currentUser.role !== 'member') {
        window.location.href = 'dashboard.html';
        return;
    }
    
    applyRoleUI(AppState.currentUser.role);
    initializeNavigation();
    updateMyProgress();
    
    // Switch role button
    document.getElementById('switchRoleBtn')?.addEventListener('click', () => {
        localStorage.removeItem('currentUserRole');
        window.location.href = 'login.html';
    });
});

// Update my progress
function updateMyProgress() {
    const currentMemberId = AppState.currentUser.id || (AppState.teamMembers.length > 0 ? AppState.teamMembers[0].id : null);
    if (!currentMemberId) return;

    const myTasks = AppState.tasks.filter(t => t.assigneeId === currentMemberId);
    const total = myTasks.length;
    const completed = myTasks.filter(t => t.status === 'completed').length;
    const inProgress = myTasks.filter(t => t.status === 'in-progress').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('myTotalTasks').textContent = total;
    document.getElementById('myCompletedTasks').textContent = completed;
    document.getElementById('myInProgressTasks').textContent = inProgress;
    document.getElementById('myCompletionRate').textContent = `${completionRate}%`;

    // Task breakdown
    const breakdown = document.getElementById('myTaskBreakdown');
    if (breakdown) {
        const byStatus = {
            'todo': myTasks.filter(t => t.status === 'todo').length,
            'in-progress': inProgress,
            'completed': completed
        };

        const byPriority = {
            'high': myTasks.filter(t => t.priority === 'high').length,
            'medium': myTasks.filter(t => t.priority === 'medium').length,
            'low': myTasks.filter(t => t.priority === 'low').length
        };

        breakdown.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
                <div>
                    <h4 style="margin-bottom: 0.75rem;">By Status</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>To Do</span>
                            <strong>${byStatus.todo}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>In Progress</span>
                            <strong>${byStatus['in-progress']}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Completed</span>
                            <strong>${byStatus.completed}</strong>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 style="margin-bottom: 0.75rem;">By Priority</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>High</span>
                            <strong>${byPriority.high}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Medium</span>
                            <strong>${byPriority.medium}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Low</span>
                            <strong>${byPriority.low}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
