// Projects Page Logic

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Check if user is logged in
    if (!checkUserRole()) {
        window.location.href = 'login.html';
        return;
    }
    
    applyRoleUI(AppState.currentUser.role);
    initializeNavigation();
    initializeProjectPage();
    
    // Switch role button
    document.getElementById('switchRoleBtn')?.addEventListener('click', () => {
        localStorage.removeItem('currentUserRole');
        window.location.href = 'login.html';
    });
});

// Initialize projects page
function initializeProjectPage() {
    renderProjects();
    
    // Show/hide add project button based on role
    if (AppState.currentUser.role === 'leader') {
        document.getElementById('addProjectBtn').style.display = 'inline-flex';
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            openProjectModal();
        });
    }

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

// Render projects grid
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
                    <div class="project-actions" ${AppState.currentUser.role !== 'leader' ? 'style="display: none;"' : ''}>
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
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            openProjectModal(id);
        });
    });

    container.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this project?')) {
                deleteProject(id);
            }
        });
    });
}

// Open project modal
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
        const today = getToday();
        document.getElementById('projectStartDate').value = today;
    }

    renderMemberCheckboxes('projectMembers', projectId ? AppState.projects.find(p => p.id === projectId)?.members || [] : []);
    modal.classList.add('active');
}

// Close project modal
function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

// Save project
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
    closeProjectModal();
}

// Delete project
function deleteProject(id) {
    if (AppState.currentUser.role !== 'leader') {
        alert('Only team leaders can delete projects.');
        return;
    }

    AppState.projects = AppState.projects.filter(p => p.id !== id);
    AppState.tasks = AppState.tasks.filter(t => t.projectId !== id);
    saveData();
    renderProjects();
}
