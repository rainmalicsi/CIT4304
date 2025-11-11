// Gantt Chart Page Logic

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Check if user is logged in
    if (!checkUserRole()) {
        window.location.href = 'login.html';
        return;
    }
    
    applyRoleUI(AppState.currentUser.role);
    initializeNavigation();
    initializeGantt();
    
    // Switch role button
    document.getElementById('switchRoleBtn')?.addEventListener('click', () => {
        localStorage.removeItem('currentUserRole');
        window.location.href = 'login.html';
    });
});

// Initialize Gantt Chart
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

    gantt.init("ganttChart", new Date());
    
    gantt.attachEvent("onAfterTaskUpdate", (id, task) => {
        // Check if it's a project
        if (id.toString().startsWith('project-')) {
            const projectId = parseInt(id.toString().replace('project-', ''));
            const appProject = AppState.projects.find(p => p.id === projectId);
            if (appProject) {
                appProject.startDate = gantt.templates.format_date(gantt.config.date_format)(task.start_date);
                appProject.endDate = gantt.templates.format_date(gantt.config.date_format)(task.end_date);
                saveData();
            }
        } else {
            // It's a task
            const appTask = AppState.tasks.find(t => t.id === parseInt(id));
            if (appTask) {
                appTask.startDate = gantt.templates.format_date(gantt.config.date_format)(task.start_date);
                appTask.dueDate = gantt.templates.format_date(gantt.config.date_format)(task.end_date);
                saveData();
            }
        }
    });

    updateGanttChart();
    setupZoomButtons();
}

// Update Gantt Chart with data
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

// Setup zoom buttons
function setupZoomButtons() {
    var zoomLevels = [
        { name: 'day',    scale_unit: 'day',   date_scale: '%d %M %Y', subscales: [{unit:'hour', step:1, date:'%H'}], scale_height:50, min_column_width:30 },
        { name: 'week',   scale_unit: 'week',  date_scale: 'Week %W, %Y', subscales: [{unit:'day', step:1, date:'%d %M'}], scale_height:50, min_column_width:50 },
        { name: 'month',  scale_unit: 'month', date_scale: '%F %Y',      subscales: [{unit:'week', step:1, date:'W%W'}], scale_height:50, min_column_width:70 }
    ];

    var currentZoom = 1;

    function applyZoom(index){
        index = Math.max(0, Math.min(zoomLevels.length - 1, index));
        var lvl = zoomLevels[index];
        gantt.config.scale_unit = lvl.scale_unit;
        gantt.config.date_scale = lvl.date_scale;
        gantt.config.subscales = lvl.subscales;
        gantt.config.scale_height = lvl.scale_height;
        gantt.config.min_column_width = lvl.min_column_width;
        currentZoom = index;
        try { gantt.render(); } catch (e) { }
        var btnIn = document.getElementById('zoomIn');
        var btnOut = document.getElementById('zoomOut');
        if(btnIn) btnIn.disabled = (currentZoom <= 0);
        if(btnOut) btnOut.disabled = (currentZoom >= zoomLevels.length - 1);
    }

    var inBtn = document.getElementById('zoomIn');
    var outBtn = document.getElementById('zoomOut');
    if(inBtn) inBtn.addEventListener('click', function(e){ e.preventDefault(); applyZoom(currentZoom - 1); });
    if(outBtn) outBtn.addEventListener('click', function(e){ e.preventDefault(); applyZoom(currentZoom + 1); });

    applyZoom(currentZoom);
}
