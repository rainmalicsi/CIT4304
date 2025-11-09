const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { auth, isLeader } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects (Leader sees all, Member sees assigned)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Leader') {
      projects = await Project.find().populate('createdBy', 'name email').populate('teamMembers', 'name email role title');
    } else {
      projects = await Project.find({ teamMembers: req.user.userId })
        .populate('createdBy', 'name email')
        .populate('teamMembers', 'name email role title');
    }
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email role title');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access: Leader can see all, Member only assigned
    if (req.user.role !== 'Leader' && !project.teamMembers.some(m => m._id.toString() === req.user.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create new project (Leader only)
// @access  Private (Leader)
router.post('/', [auth, isLeader], [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, status, teamMembers } = req.body;

    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      status: status || 'Planned',
      createdBy: req.user.userId,
      teamMembers: teamMembers || []
    });

    await project.save();
    await project.populate('createdBy', 'name email');
    await project.populate('teamMembers', 'name email role title');

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project (Leader only)
// @access  Private (Leader)
router.put('/:id', [auth, isLeader], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { name, description, startDate, endDate, status, teamMembers } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (status) project.status = status;
    if (teamMembers) project.teamMembers = teamMembers;
    project.updatedAt = Date.now();

    await project.save();
    await project.populate('createdBy', 'name email');
    await project.populate('teamMembers', 'name email role title');

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project (Leader only)
// @access  Private (Leader)
router.delete('/:id', [auth, isLeader], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

