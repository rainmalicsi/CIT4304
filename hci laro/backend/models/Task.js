const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update project progress when task status changes
taskSchema.post('save', async function() {
  const Project = mongoose.model('Project');
  const project = await Project.findById(this.project);
  if (project) {
    await project.calculateProgress();
  }
});

taskSchema.post('findOneAndUpdate', async function() {
  const task = await this.model.findOne(this.getQuery());
  if (task) {
    const Project = mongoose.model('Project');
    const project = await Project.findById(task.project);
    if (project) {
      await project.calculateProgress();
    }
  }
});

module.exports = mongoose.model('Task', taskSchema);

