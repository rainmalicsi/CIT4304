import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Gantt = () => {
  const { isLeader } = useAuth();
  const ganttContainer = useRef(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ganttLoaded, setGanttLoaded] = useState(false);

  // Load DHTMLX Gantt from CDN
  useEffect(() => {
    if (!window.gantt) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js';
      script.onload = () => {
        setGanttLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setGanttLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/tasks')
      ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeGantt = () => {
    if (!window.gantt || !ganttContainer.current) return () => {};

    // Clear existing gantt
    ganttContainer.current.innerHTML = '';

    // Configure Gantt
    window.gantt.config.date_format = '%Y-%m-%d';
    window.gantt.config.columns = [
      { name: 'text', label: 'Task', width: '*', tree: true },
      { name: 'start_date', label: 'Start', align: 'center', width: 100 },
      { name: 'duration', label: 'Duration', align: 'center', width: 80 },
      { name: 'progress', label: 'Progress', align: 'center', width: 80, template: (task) => `${task.progress || 0}%` }
    ];

    // Disable editing for Members
    if (!isLeader) {
      window.gantt.config.readonly = true;
      window.gantt.config.drag_links = false;
      window.gantt.config.drag_progress = false;
      window.gantt.config.drag_resize = false;
      window.gantt.config.drag_move = false;
    } else {
      window.gantt.config.readonly = false;
      window.gantt.config.drag_links = true;
      window.gantt.config.drag_progress = true;
      window.gantt.config.drag_resize = true;
      window.gantt.config.drag_move = true;
    }

    // Prepare data structure
    const ganttData = [];
    const projectMap = new Map();

    // Add projects as parent tasks
    projects.forEach((project) => {
      const projectTask = {
        id: `project-${project._id}`,
        text: project.name,
        start_date: new Date(project.startDate).toISOString().split('T')[0],
        duration: Math.ceil(
          (new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
        ),
        progress: project.progress / 100,
        type: 'project',
        open: true,
        parent: 0
      };
      ganttData.push(projectTask);
      projectMap.set(project._id, projectTask.id);
    });

    // Add tasks as children
    tasks.forEach((task) => {
      const projectId = task.project._id || task.project;
      const parentId = projectMap.get(projectId);
      if (parentId) {
        const taskItem = {
          id: `task-${task._id}`,
          text: task.title,
          start_date: new Date(task.dueDate).toISOString().split('T')[0],
          duration: 1,
          progress: task.status === 'Completed' ? 1 : task.status === 'In Progress' ? 0.5 : 0,
          type: 'task',
          parent: parentId
        };
        ganttData.push(taskItem);
      }
    });

    // Initialize Gantt
    window.gantt.init(ganttContainer.current);
    window.gantt.parse({ data: ganttData });

    // Handle updates if Leader
    if (isLeader) {
      window.gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
        handleTaskUpdate(id, task);
      });
    }

    // Cleanup function
    return () => {
      if (window.gantt && window.gantt.destructor) {
        window.gantt.destructor();
      }
    };
  };

  useEffect(() => {
    if (ganttLoaded && ganttContainer.current && window.gantt) {
      if (projects.length > 0 || tasks.length > 0) {
        const cleanup = initializeGantt();
        return cleanup;
      } else {
        // Initialize empty gantt
        if (ganttContainer.current) {
          ganttContainer.current.innerHTML = '';
        }
      }
    }
  }, [projects, tasks, ganttLoaded, isLeader]);

  const handleTaskUpdate = async (id, task) => {
    if (id.startsWith('task-')) {
      const taskId = id.replace('task-', '');
      try {
        const originalTask = tasks.find(t => t._id === taskId);
        if (originalTask) {
          const updates = {
            dueDate: task.start_date,
            status: task.progress === 1 ? 'Completed' : task.progress > 0 ? 'In Progress' : 'Pending'
          };
          await axios.put(`/api/tasks/${taskId}`, updates);
          fetchData();
        }
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gantt Chart</h1>
        <p className="text-gray-600 mt-1">
          {isLeader
            ? 'Visualize and manage project timelines. Drag tasks to adjust dates.'
            : 'View project timelines and task schedules.'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (window.gantt) {
                  window.gantt.ext.zoom.setLevel('day');
                }
              }}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Day
            </button>
            <button
              onClick={() => {
                if (window.gantt) {
                  window.gantt.ext.zoom.setLevel('week');
                }
              }}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Week
            </button>
            <button
              onClick={() => {
                if (window.gantt) {
                  window.gantt.ext.zoom.setLevel('month');
                }
              }}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Month
            </button>
          </div>
        </div>
        <div ref={ganttContainer} className="gantt-container" style={{ height: '600px' }}></div>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No projects found. Create a project to see it in the Gantt chart.</p>
        </div>
      )}
    </div>
  );
};

export default Gantt;

