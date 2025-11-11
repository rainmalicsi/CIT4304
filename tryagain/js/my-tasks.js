// My Tasks Page Logic (Member Only)

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
    initializeMyTasksPage();
    
    // Switch role button
    document.getElementById('switchRoleBtn')?.addEventListener('click', () => {
        localStorage.removeItem('currentUserRole');
        window.location.href = 'login.html';
    });
});

// Initialize my tasks page
function initializeMyTasksPage() {
    renderMyTasks();
    
    document.getElementById('addMyTaskBtn')?.addEventListener('click', () => {
        openTaskModal();
    });

    document.getElementById('saveTaskBtn')?.addEventListener('click', () => {
        saveTask();
    });

    document.getElementById('cancelTaskBtn')?.addEventListener('click', () => {
        closeTaskModal();
    });

    document.getElementById('closeTaskModal')?.addEventListener('click', () => {
        closeTaskModal();
    });
    
    // Filter buttons for My Tasks
    const myTasksFilters = document.querySelectorAll('#my-tasks .filter-btn');
    myTasksFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            myTasksFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentFilter = btn.getAttribute('data-filter');
            renderMyTasks();
        });
    });
}

// Render my tasks
function renderMyTasks() {
    const container = document.getElementById('myTasksList');
    if (!container) return;

    const currentMemberId = AppState.currentUser.id || (AppState.teamMembers.length > 0 ? AppState.teamMembers[0].id : null);
    if (!currentMemberId) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No tasks assigned to you yet.</p>';
        return;
    }

    let myTasks = AppState.tasks.filter(t => t.assigneeId === currentMemberId);
    
    if (AppState.currentFilter !== 'all') {
        myTasks = myTasks.filter(t => t.status === AppState.currentFilter);
    }

    if (myTasks.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No tasks found.</p>';
        return;
    }

    container.innerHTML = myTasks.map(task => {
        const project = AppState.projects.find(p => p.id === task.projectId);
        const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();

        return `
            <div class="task-item ${isOverdue ? 'overdue' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''} 
                       onchange="toggleTaskStatus(${task.id})">
                <div class="task-content">
                    <div class="task-title">${task.name}</div>
                    <div class="task-meta">
                        <span>${project?.name || 'Personal Task'}</span>
                        <span>${formatDate(task.dueDate)}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="task-badge ${task.status}">${task.status}</span>
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                    <button class="action-btn edit-task" data-id="${task.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-task" data-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners
    container.querySelectorAll('.edit-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            openTaskModal(id);
        });
    });

    container.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(id);
            }
        });
    });
}

// Make toggleTaskStatus globally accessible
window.toggleTaskStatus = function(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (task) {
        task.status = task.status === 'completed' ? 'todo' : 'completed';
        saveData();
        renderMyTasks();
    }
};

// Open task modal
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const title = document.getElementById('taskModalTitle');

    form.reset();
    document.getElementById('taskId').value = '';

    // Populate project dropdown
    const projectSelect = document.getElementById('taskProject');
    projectSelect.innerHTML = '<option value="">Select Project</option>' +
        AppState.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    if (taskId) {
        const task = AppState.tasks.find(t => t.id === taskId);
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskName').value = task.name;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskProject').value = task.projectId || '';
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskStartDate').value = task.startDate;
            document.getElementById('taskDueDate').value = task.dueDate;
            document.getElementById('taskPriority').value = task.priority || 'medium';
        }
    } else {
        title.textContent = 'New Task';
        const today = getToday();
        document.getElementById('taskStartDate').value = today;
        document.getElementById('taskDueDate').value = today;
    }

    modal.classList.add('active');
}

// Close task modal
function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
}

// Save task
function saveTask() {
    const form = document.getElementById('taskForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('taskId').value;
    const currentMemberId = AppState.currentUser.id || (AppState.teamMembers.length > 0 ? AppState.teamMembers[0].id : null);
    
    const task = {
        name: document.getElementById('taskName').value,
        description: document.getElementById('taskDescription').value,
        projectId: parseInt(document.getElementById('taskProject').value) || null,
        status: document.getElementById('taskStatus').value,
        startDate: document.getElementById('taskStartDate').value,
        dueDate: document.getElementById('taskDueDate').value,
        assigneeId: currentMemberId,
        priority: document.getElementById('taskPriority').value
    };

    if (id) {
        const index = AppState.tasks.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            AppState.tasks[index] = { ...AppState.tasks[index], ...task };
        }
    } else {
        const newId = AppState.tasks.length > 0 
            ? Math.max(...AppState.tasks.map(t => t.id)) + 1 
            : 1;
        AppState.tasks.push({ id: newId, ...task });
    }

    saveData();
    renderMyTasks();
    closeTaskModal();
}

// Delete task
function deleteTask(id) {
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    saveData();
    renderMyTasks();
}
