// Team Page Logic

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Check if user is logged in
    if (!checkUserRole()) {
        window.location.href = 'login.html';
        return;
    }
    
    applyRoleUI(AppState.currentUser.role);
    initializeNavigation();
    initializeTeamPage();
    
    // Switch role button
    document.getElementById('switchRoleBtn')?.addEventListener('click', () => {
        localStorage.removeItem('currentUserRole');
        window.location.href = 'login.html';
    });
});

// Initialize team page
function initializeTeamPage() {
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

// Render team members grid
function renderTeam() {
    const container = document.getElementById('teamGrid');
    if (!container) return;

    const isLeader = AppState.currentUser.role === 'leader';

    container.innerHTML = AppState.teamMembers.map(member => `
        <div class="team-member-card">
            <div class="member-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="member-name">${member.name}</div>
            <div class="member-role">${member.role}</div>
            <div class="member-email">${member.email}</div>
            <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; ${!isLeader ? 'visibility: hidden;' : ''}">
                <button class="btn btn-secondary edit-member" data-id="${member.id}" style="padding: 0.5rem 1rem;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary delete-member" data-id="${member.id}" style="padding: 0.5rem 1rem;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');

    if (isLeader) {
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
}

// Open member modal
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

// Close member modal
function closeMemberModal() {
    document.getElementById('memberModal').classList.remove('active');
}

// Save member
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

// Delete member
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
}
