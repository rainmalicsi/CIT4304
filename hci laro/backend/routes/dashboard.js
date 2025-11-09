const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let projects, tasks;
    
    if (req.user.role === 'Leader') {
      projects = await Project.find();
      tasks = await Task.find();
    } else {
      projects = await Project.find({ teamMembers: req.user.userId });
      tasks = await Task.find({ assignedTo: req.user.userId });
    }

    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const upcomingDeadlines = tasks
      .filter(t => t.status !== 'Completed' && new Date(t.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Project status breakdown
    const projectStatus = {
      Planned: projects.filter(p => p.status === 'Planned').length,
      Ongoing: projects.filter(p => p.status === 'Ongoing').length,
      Completed: projects.filter(p => p.status === 'Completed').length
    };

    // Task status breakdown
    const taskStatus = {
      Pending: tasks.filter(t => t.status === 'Pending').length,
      'In Progress': tasks.filter(t => t.status === 'In Progress').length,
      Completed: tasks.filter(t => t.status === 'Completed').length
    };

    // Task priority breakdown
    const taskPriority = {
      Low: tasks.filter(t => t.priority === 'Low').length,
      Medium: tasks.filter(t => t.priority === 'Medium').length,
      High: tasks.filter(t => t.priority === 'High').length
    };

    // Recent projects
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(p => ({
        id: p._id,
        name: p.name,
        status: p.status,
        progress: p.progress,
        createdAt: p.createdAt
      }));

    res.json({
      summary: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks
      },
      upcomingDeadlines: upcomingDeadlines.map(t => ({
        id: t._id,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority,
        project: t.project
      })),
      projectStatus,
      taskStatus,
      taskPriority,
      recentProjects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

