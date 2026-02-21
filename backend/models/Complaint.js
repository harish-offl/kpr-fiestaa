const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaint_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  },
  batch_id: {
    type: String,
    required: true
  },
  issue_description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'REVIEWING', 'RESOLVED', 'ESCALATED'],
    default: 'PENDING'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  assigned_to: {
    type: String,
    default: null
  },
  resolution_notes: {
    type: String,
    default: ''
  },
  blockchain_hash: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  resolved_at: {
    type: Date,
    default: null
  }
});

// Update timestamp on save
complaintSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
