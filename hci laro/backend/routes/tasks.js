const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth, isLeader } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks (Leader sees all, Member sees own)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Leader') {
      tasks = await Task.find()
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ dueDate: 1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user.userId })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ dueDate: 1 });
    }
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access: Leader can see all, Member only own tasks
    if (req.user.role !== 'Leader' && task.assignedTo._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('project').notEmpty().withMessage('Project is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, dueDate, priority, status, project, assignedTo } = req.body;

    // Verify project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access: Leader can create in any project, Member only in assigned projects
    if (req.user.role !== 'Leader' && !projectDoc.teamMembers.some(m => m.toString() === req.user.userId)) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority: priority || 'Medium',
      status: status || 'Pending',
      project,
      assignedTo: assignedTo || req.user.userId,
      createdBy: req.user.userId
    });

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    // Update project progress
    await projectDoc.calculateProgress();

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access: Leader can edit all, Member only own tasks
    if (req.user.role !== 'Leader' && task.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, dueDate, priority, status, assignedTo } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    // Only Leader can reassign tasks
    if (assignedTo && req.user.role === 'Leader') {
      task.assignedTo = assignedTo;
    }
    task.updatedAt = Date.now();

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    // Update project progress
    const project = await Project.findById(task.project);
    if (project) {
      await project.calculateProgress();
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access: Leader can delete all, Member can delete own tasks
    if (req.user.role !== 'Leader' && task.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const projectId = task.project;
    await Task.findByIdAndDelete(req.params.id);

    // Update project progress
    const project = await Project.findById(projectId);
    if (project) {
      await project.calculateProgress();
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

