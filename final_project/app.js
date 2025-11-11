// Application State
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

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    checkUserRole();
    initializeLogin();
    initializeNavigation();
    initializeModals();
    initializeDashboard();
    initializeProjects();
    initializeTasks();
    initializeCalendar();
    initializeGantt();
    initializeTeam();
    initializeMemberFeatures();
    updateDashboard();
});

// Role Management
function checkUserRole() {
    const savedRole = localStorage.getItem('currentUserRole');
    if (savedRole) {
        AppState.currentUser.role = savedRole;
        applyRoleUI(savedRole);
    }
}

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

function initializeLogin() {
    const loginScreen = document.getElementById('loginScreen');
    const roleButtons = document.querySelectorAll('.role-select-btn');
    
    // Check if user already has a role
    if (AppState.currentUser.role) {
        loginScreen.classList.add('hidden');
        return;
    }
    
    roleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const roleCard = btn.closest('.role-card');
            const role = roleCard.getAttribute('data-role');
            selectRole(role);
        });
    });
    
    // Switch role button
    document.getElementById('switchRoleBtn')?.addEventListener('click', () => {
        showLoginScreen();
    });
}

function selectRole(role) {
    AppState.currentUser.role = role;
    localStorage.setItem('currentUserRole', role);
    
    // Set member ID if member role (use first member or create default)
    if (role === 'member') {
        if (AppState.teamMembers.length > 0) {
            AppState.currentUser.id = AppState.teamMembers[0].id;
            AppState.currentUser.name = AppState.teamMembers[0].name;
        } else {
            // Create a default member for demo
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
    document.getElementById('loginScreen').classList.add('hidden');
    
    // Redirect to appropriate page
    if (role === 'member') {
        showPage('my-tasks');
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        const myTasksNav = document.querySelector('[data-page="my-tasks"]');
        if (myTasksNav) myTasksNav.classList.add('active');
    } else {
        showPage('dashboard');
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        const dashboardNav = document.querySelector('[data-page="dashboard"]');
        if (dashboardNav) dashboardNav.classList.add('active');
    }
    
    updateDashboard();
    renderTasks();
    if (role === 'member') {
        renderMyTasks();
        updateMyProgress();
    } else {
        renderProjects();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
}

// Data Management
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
                startDate: '2024-01-01',
                endDate: '2024-03-31',
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

function saveData() {
    localStorage.setItem('projects', JSON.stringify(AppState.projects));
    localStorage.setItem('tasks', JSON.stringify(AppState.tasks));
    localStorage.setItem('teamMembers', JSON.stringify(AppState.teamMembers));
}

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            showPage(page);
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
        if (pageName === 'gantt') {
            updateGanttChart();
        } else if (pageName === 'calendar') {
            updateCalendar();
        } else if (pageName === 'my-tasks') {
            renderMyTasks();
        } else if (pageName === 'my-progress') {
            updateMyProgress();
        }
    }
}

// Dashboard
function initializeDashboard() {
    updateDashboard();
}

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

// Projects
function initializeProjects() {
    renderProjects();
    
    document.getElementById('addProjectBtn')?.addEventListener('click', () => {
        openProjectModal();
    });

    document.getElementById('saveProjectBtn')?.addEventListener('click', () => {
        saveProject();
    });

    document.getElementById('cancelProjectBtn')?.addEventListener('click', () => {
        closeProjectModal();
    });

    document.getElementById('closeProjectModal')?.addEventListener('click', () => {
        closeProjectModal();
    });
}

function renderProjects() {
    const container = document.getElementById('projectsGrid');
    if (!container) return;

    container.innerHTML = AppState.projects.map(project => {
        const tasks = AppState.tasks.filter(t => t.projectId === project.id);
        const completed = tasks.filter(t => t.status === 'completed').length;
        const total = tasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return `
            <div class="project-card" data-id="${project.id}">
                <div class="project-header">
                    <div>
                        <div class="project-title">${project.name}</div>
                        <div class="project-description">${project.description || 'No description'}</div>
                    </div>
                    <div class="project-actions">
                        <button class="action-btn edit-project" data-id="${project.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-project" data-id="${project.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="project-meta">
                    <span class="project-status ${project.status}">${project.status}</span>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">
                        ${formatDate(project.startDate)} - ${formatDate(project.endDate)}
                    </span>
                </div>
                <div style="margin-top: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.85rem;">
                        <span>Progress</span>
                        <span>${progress}%</span>
                    </div>
                    <div style="height: 8px; background: var(--bg-color); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${progress}%; background: var(--primary-color); transition: width 0.3s;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners
    container.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            openProjectModal(id);
        });
    });

    container.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this project?')) {
                deleteProject(id);
            }
        });
    });
}

function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');

    form.reset();
    document.getElementById('projectId').value = '';

    if (projectId) {
        const project = AppState.projects.find(p => p.id === projectId);
        if (project) {
            title.textContent = 'Edit Project';
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectStartDate').value = project.startDate;
            document.getElementById('projectEndDate').value = project.endDate;
            document.getElementById('projectStatus').value = project.status;
        }
    } else {
        title.textContent = 'New Project';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('projectStartDate').value = today;
    }

    renderMemberCheckboxes('projectMembers', projectId ? AppState.projects.find(p => p.id === projectId)?.members || [] : []);
    modal.classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

function saveProject() {
    // Restrict project creation to leaders only
    if (AppState.currentUser.role !== 'leader') {
        alert('Only team leaders can create projects.');
        return;
    }

    const form = document.getElementById('projectForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('projectId').value;
    const project = {
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        startDate: document.getElementById('projectStartDate').value,
        endDate: document.getElementById('projectEndDate').value,
        status: document.getElementById('projectStatus').value,
        members: Array.from(document.querySelectorAll('#projectMembers input:checked')).map(cb => parseInt(cb.value))
    };

    if (id) {
        const index = AppState.projects.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            AppState.projects[index] = { ...AppState.projects[index], ...project };
        }
    } else {
        const newId = AppState.projects.length > 0 
            ? Math.max(...AppState.projects.map(p => p.id)) + 1 
            : 1;
        AppState.projects.push({ id: newId, ...project });
    }

    saveData();
    renderProjects();
    updateDashboard();
    closeProjectModal();
    updateGanttChart();
}

function deleteProject(id) {
    // Restrict project deletion to leaders only
    if (AppState.currentUser.role !== 'leader') {
        alert('Only team leaders can delete projects.');
        return;
    }

    AppState.projects = AppState.projects.filter(p => p.id !== id);
    AppState.tasks = AppState.tasks.filter(t => t.projectId !== id);
    saveData();
    renderProjects();
    renderTasks();
    updateDashboard();
    updateGanttChart();
}

// Tasks
function initializeTasks() {
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
        updateDashboard();
        updateGanttChart();
        
        // Update member-specific views if member role
        if (AppState.currentUser.role === 'member') {
            renderMyTasks();
            updateMyProgress();
        }
    }
};

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
        // Members can only assign to themselves
        assigneeSelect.innerHTML = '<option value="">Unassigned</option>';
        // Find current member (for demo, use first member or create a default)
        const currentMemberId = AppState.currentUser.id || (AppState.teamMembers.length > 0 ? AppState.teamMembers[0].id : null);
        if (currentMemberId) {
            const member = AppState.teamMembers.find(m => m.id === currentMemberId);
            if (member) {
                assigneeSelect.innerHTML += `<option value="${member.id}" selected>${member.name} (Me)</option>`;
            }
        }
        if (hint) hint.style.display = 'block';
        assigneeSelect.disabled = false; // Allow them to see it's assigned to them
    } else {
        // Leaders can assign to anyone
        assigneeSelect.innerHTML = '<option value="">Unassigned</option>' +
            AppState.teamMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
        if (hint) hint.style.display = 'none';
        assigneeSelect.disabled = false;
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
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('taskStartDate').value = today;
        document.getElementById('taskDueDate').value = today;
    }

    modal.classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
}

function saveTask() {
    const form = document.getElementById('taskForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('taskId').value;
    let assigneeId = parseInt(document.getElementById('taskAssignee').value) || null;
    
    // Enforce member restriction: members can only assign to themselves
    if (AppState.currentUser.role === 'member') {
        const currentMemberId = AppState.currentUser.id || (AppState.teamMembers.length > 0 ? AppState.teamMembers[0].id : null);
        if (currentMemberId) {
            assigneeId = currentMemberId; // Force assignment to current member
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
    updateDashboard();
    closeTaskModal();
    updateGanttChart();
    updateCalendar();
    
    // Update member-specific views if member role
    if (AppState.currentUser.role === 'member') {
        renderMyTasks();
        updateMyProgress();
    }
}

function deleteTask(id) {
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
    updateDashboard();
    updateGanttChart();
    updateCalendar();
}

// Calendar
function initializeCalendar() {
    updateCalendar();
    
    document.getElementById('prevMonth')?.addEventListener('click', () => {
        AppState.currentDate.setMonth(AppState.currentDate.getMonth() - 1);
        updateCalendar();
    });

    document.getElementById('nextMonth')?.addEventListener('click', () => {
        AppState.currentDate.setMonth(AppState.currentDate.getMonth() + 1);
        updateCalendar();
    });

    document.getElementById('todayBtn')?.addEventListener('click', () => {
        AppState.currentDate = new Date();
        updateCalendar();
    });
}

function updateCalendar() {
    const container = document.getElementById('calendarGrid');
    const monthHeader = document.getElementById('currentMonth');
    if (!container || !monthHeader) return;

    const year = AppState.currentDate.getFullYear();
    const month = AppState.currentDate.getMonth();
    
    monthHeader.textContent = new Date(year, month).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let html = dayNames.map(day => 
        `<div class="calendar-day-header">${day}</div>`
    ).join('');

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const dayTasks = AppState.tasks.filter(t => {
            const taskDate = new Date(t.dueDate).toISOString().split('T')[0];
            return taskDate === dateStr;
        });

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-events">
                    ${dayTasks.slice(0, 3).map(task => 
                        `<div class="calendar-event" title="${task.name}">${task.name}</div>`
                    ).join('')}
                    ${dayTasks.length > 3 ? `<div class="calendar-event">+${dayTasks.length - 3} more</div>` : ''}
                </div>
            </div>
        `;
    }

    // Next month days
    const totalCells = 42; // 6 weeks * 7 days
    const remainingCells = totalCells - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }

    container.innerHTML = html;
}

// Gantt Chart
function initializeGantt() {
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.columns = [
        { name: "text", label: "Task", width: 200, tree: true },
        { name: "start_date", label: "Start", width: 100 },
        { name: "duration", label: "Duration", width: 80 }
    ];
    gantt.config.scale_unit = "day";
    gantt.config.step = 1;
    gantt.config.date_scale = "%d %M";
    gantt.config.subscales = [
        { unit: "month", step: 1, date: "%F, %Y" }
    ];
    gantt.config.fit_tasks = true;
    gantt.config.readonly = false;
    gantt.config.drag_resize = true;
    gantt.config.drag_move = true;
    gantt.config.drag_progress = true;
    gantt.config.drag_links = true;

    gantt.init("ganttChart");
    
    gantt.attachEvent("onAfterTaskUpdate", (id, task) => {
        // Check if it's a project
        if (id.toString().startsWith('project-')) {
            const projectId = parseInt(id.toString().replace('project-', ''));
            const appProject = AppState.projects.find(p => p.id === projectId);
            if (appProject) {
                appProject.startDate = gantt.templates.format_date(gantt.config.date_format)(task.start_date);
                appProject.endDate = gantt.templates.format_date(gantt.config.date_format)(task.end_date);
                saveData();
                updateDashboard();
            }
        } else {
            // It's a task
            const appTask = AppState.tasks.find(t => t.id === parseInt(id));
            if (appTask) {
                appTask.startDate = gantt.templates.format_date(gantt.config.date_format)(task.start_date);
                appTask.dueDate = gantt.templates.format_date(gantt.config.date_format)(task.end_date);
                saveData();
                updateDashboard();
            }
        }
    });

    updateGanttChart();
}

function updateGanttChart() {
    const data = [];
    const links = [];

    // Add projects as parent tasks
    AppState.projects.forEach(project => {
        data.push({
            id: `project-${project.id}`,
            text: project.name,
            start_date: project.startDate,
            duration: calculateDuration(project.startDate, project.endDate),
            type: "project",
            open: true
        });

        // Add tasks under projects
        AppState.tasks
            .filter(t => t.projectId === project.id)
            .forEach(task => {
                data.push({
                    id: task.id,
                    text: task.name,
                    start_date: task.startDate,
                    duration: calculateDuration(task.startDate, task.dueDate),
                    parent: `project-${project.id}`,
                    progress: task.status === 'completed' ? 1 : 0.5,
                    type: "task"
                });
            });
    });

    // Add unassigned tasks
    AppState.tasks
        .filter(t => !t.projectId)
        .forEach(task => {
            data.push({
                id: task.id,
                text: task.name,
                start_date: task.startDate,
                duration: calculateDuration(task.startDate, task.dueDate),
                progress: task.status === 'completed' ? 1 : 0.5,
                type: "task"
            });
        });

    gantt.clearAll();
    gantt.parse({ data, links });
}

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
}

// Team
function initializeTeam() {
    renderTeam();
    
    document.getElementById('addMemberBtn')?.addEventListener('click', () => {
        openMemberModal();
    });

    document.getElementById('saveMemberBtn')?.addEventListener('click', () => {
        saveMember();
    });

    document.getElementById('cancelMemberBtn')?.addEventListener('click', () => {
        closeMemberModal();
    });

    document.getElementById('closeMemberModal')?.addEventListener('click', () => {
        closeMemberModal();
    });
}

function renderTeam() {
    const container = document.getElementById('teamGrid');
    if (!container) return;

    container.innerHTML = AppState.teamMembers.map(member => `
        <div class="team-member-card">
            <div class="member-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="member-name">${member.name}</div>
            <div class="member-role">${member.role}</div>
            <div class="member-email">${member.email}</div>
            <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
                <button class="btn btn-secondary edit-member" data-id="${member.id}" style="padding: 0.5rem 1rem;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary delete-member" data-id="${member.id}" style="padding: 0.5rem 1rem;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.edit-member').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            openMemberModal(id);
        });
    });

    container.querySelectorAll('.delete-member').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this team member?')) {
                deleteMember(id);
            }
        });
    });
}

function openMemberModal(memberId = null) {
    const modal = document.getElementById('memberModal');
    const form = document.getElementById('memberForm');
    const title = document.getElementById('memberModalTitle');

    form.reset();
    document.getElementById('memberId').value = '';

    if (memberId) {
        const member = AppState.teamMembers.find(m => m.id === memberId);
        if (member) {
            title.textContent = 'Edit Team Member';
            document.getElementById('memberId').value = member.id;
            document.getElementById('memberName').value = member.name;
            document.getElementById('memberEmail').value = member.email;
            document.getElementById('memberRole').value = member.role;
        }
    } else {
        title.textContent = 'Add Team Member';
    }

    modal.classList.add('active');
}

function closeMemberModal() {
    document.getElementById('memberModal').classList.remove('active');
}

function saveMember() {
    const form = document.getElementById('memberForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('memberId').value;
    const member = {
        name: document.getElementById('memberName').value,
        email: document.getElementById('memberEmail').value,
        role: document.getElementById('memberRole').value
    };

    if (id) {
        const index = AppState.teamMembers.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            AppState.teamMembers[index] = { ...AppState.teamMembers[index], ...member };
        }
    } else {
        const newId = AppState.teamMembers.length > 0 
            ? Math.max(...AppState.teamMembers.map(m => m.id)) + 1 
            : 1;
        AppState.teamMembers.push({ id: newId, ...member });
    }

    saveData();
    renderTeam();
    closeMemberModal();
}

function deleteMember(id) {
    AppState.teamMembers = AppState.teamMembers.filter(m => m.id !== id);
    AppState.tasks = AppState.tasks.map(t => {
        if (t.assigneeId === id) {
            t.assigneeId = null;
        }
        return t;
    });
    saveData();
    renderTeam();
    renderTasks();
}

// Modals
function initializeModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Helper Functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

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

// Member-specific features
function initializeMemberFeatures() {
    // My Tasks page
    document.getElementById('addMyTaskBtn')?.addEventListener('click', () => {
        openTaskModal();
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
