// Calendar Page Logic

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Check if user is logged in
    if (!checkUserRole()) {
        window.location.href = 'login.html';
        return;
    }
    
    applyRoleUI(AppState.currentUser.role);
    initializeNavigation();
    initializeCalendarPage();
    
    // Switch role button
    document.getElementById('switchRoleBtn')?.addEventListener('click', () => {
        localStorage.removeItem('currentUserRole');
        window.location.href = 'login.html';
    });
});

// Initialize calendar page
function initializeCalendarPage() {
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

// Update calendar
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
