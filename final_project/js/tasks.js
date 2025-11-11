// Tasks Page Logic

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Check if user is logged in
    if (!checkUserRole()) {
        window.location.href = 'login.html';
        return;
    }
    
    applyRoleUI(AppState.currentUser.role);
    initializeNavigation();
    initializeTasksPage();
    
    // Switch role button
    document.getElementById('switchRoleBtn')?.addEventListener('click', () => {
        localStorage.removeItem('currentUserRole');
        window.location.href = 'login.html';
    });
});

// Initialize tasks page
function initializeTasksPage() {
    renderTasks();
    
    document.getElementById('addTaskBtn')?.addEventListener('click', () => {
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

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentFilter = btn.getAttribute('data-filter');
            renderTasks();
        });
    });
}

// Render tasks list
function renderTasks() {
    const container = document.getElementById('tasksList');
    if (!container) return;

    let filteredTasks = AppState.tasks;
    
    // Filter by role: members only see their tasks, leaders see all
    if (AppState.currentUser.role === 'member') {
        const currentMemberId = AppState.currentUser.id || (AppState.teamMembers.length > 0 ? AppState.teamMembers[0].id : null);
        if (currentMemberId) {
            filteredTasks = AppState.tasks.filter(t => t.assigneeId === currentMemberId);
        } else {
            filteredTasks = [];
        }
    }
    
    if (AppState.currentFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.status === AppState.currentFilter);
    }

    container.innerHTML = filteredTasks.map(task => {
        const project = AppState.projects.find(p => p.id === task.projectId);
        const assignee = AppState.teamMembers.find(m => m.id === task.assigneeId);
        const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();

        return `
            <div class="task-item ${isOverdue ? 'overdue' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''} 
                       onchange="toggleTaskStatus(${task.id})">
                <div class="task-content">
                    <div class="task-title">${task.name}</div>
                    <div class="task-meta">
                        <span>${project?.name || 'No Project'}</span>
                        <span>${formatDate(task.dueDate)}</span>
                        ${assignee ? `<span>${assignee.name}</span>` : ''}
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
        renderTasks();
    }
};

// Open task modal
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const title = document.getElementById('taskModalTitle');
    const hint = document.querySelector('.form-hint.member-only');

    form.reset();
    document.getElementById('taskId').value = '';

    // Populate project dropdown
    const projectSelect = document.getElementById('taskProject');
    projectSelect.innerHTML = '<option value="">Select Project</option>' +
        AppState.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    // Populate assignee dropdown based on role
    const assigneeSelect = document.getElementById('taskAssignee');
    if (AppState.currentUser.role === 'member') {
        assigneeSelect.innerHTML = '<option value="">Unassigned</option>';
        const currentMemberId = AppState.currentUser.id || (AppState.teamMembers.length > 0 ? AppState.teamMembers[0].id : null);
        if (currentMemberId) {
            const member = AppState.teamMembers.find(m => m.id === currentMemberId);
            if (member) {
                assigneeSelect.innerHTML += `<option value="${member.id}" selected>${member.name} (Me)</option>`;
            }
        }
        if (hint) hint.style.display = 'block';
    } else {
        assigneeSelect.innerHTML = '<option value="">Unassigned</option>' +
            AppState.teamMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
        if (hint) hint.style.display = 'none';
    }

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
            document.getElementById('taskAssignee').value = task.assigneeId || '';
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
    let assigneeId = parseInt(document.getElementById('taskAssignee').value) || null;
    
    // Enforce member restriction
    if (AppState.currentUser.role === 'member') {
        const currentMemberId = AppState.currentUser.id || (AppState.teamMembers.length > 0 ? AppState.teamMembers[0].id : null);
        if (currentMemberId) {
            assigneeId = currentMemberId;
        }
    }
    
    const task = {
        name: document.getElementById('taskName').value,
        description: document.getElementById('taskDescription').value,
        projectId: parseInt(document.getElementById('taskProject').value) || null,
        status: document.getElementById('taskStatus').value,
        startDate: document.getElementById('taskStartDate').value,
        dueDate: document.getElementById('taskDueDate').value,
        assigneeId: assigneeId,
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
    renderTasks();
    closeTaskModal();
}

// Delete task
function deleteTask(id) {
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
}
