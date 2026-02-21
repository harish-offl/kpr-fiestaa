const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const crypto = require('crypto');

// Global blockchain reference (will be set from server.js)
let blockchainInstance = null;

// Set blockchain instance
router.setBlockchain = (blockchain) => {
  blockchainInstance = blockchain;
};

// Create new complaint
router.post('/', async (req, res) => {
  try {
    const { user_id, batch_id, issue_description, priority } = req.body;
    
    // Validate required fields
    if (!user_id || !batch_id || !issue_description) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, batch_id, issue_description' 
      });
    }
    
    // Generate unique complaint ID
    const complaint_id = `COMPLAINT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create complaint hash for blockchain
    const complaintHash = crypto
      .createHash('sha256')
      .update(complaint_id + user_id + batch_id + issue_description + Date.now())
      .digest('hex');
    
    // Create complaint
    const complaint = new Complaint({
      complaint_id,
      user_id,
      batch_id,
      issue_description,
      priority: priority || 'MEDIUM',
      blockchain_hash: complaintHash
    });
    
    await complaint.save();
    
    // Add complaint hash to blockchain
    if (blockchainInstance) {
      try {
        blockchainInstance.addBlock({
          batchID: `COMPLAINT-${complaint_id}`,
          farmerID: user_id,
          location: 'Complaint System',
          temperature: 0,
          quantity: 0,
          handlerRole: 'Complaint Handler',
          complaintHash: complaintHash,
          complaintId: complaint_id,
          type: 'COMPLAINT_RECORD'
        });
      } catch (blockchainError) {
        console.error('Blockchain error:', blockchainError);
        // Continue even if blockchain fails
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint: {
        complaint_id: complaint.complaint_id,
        status: complaint.status,
        priority: complaint.priority,
        created_at: complaint.created_at,
        blockchain_hash: complaint.blockchain_hash
      }
    });
    
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ 
      error: 'Failed to create complaint', 
      details: error.message 
    });
  }
});

// Get all complaints (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { status, priority, user_id, batch_id } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (user_id) query.user_id = user_id;
    if (batch_id) query.batch_id = batch_id;
    
    const complaints = await Complaint.find(query).sort({ created_at: -1 });
    
    res.json({
      success: true,
      count: complaints.length,
      complaints: complaints
    });
    
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ 
      error: 'Failed to fetch complaints', 
      details: error.message 
    });
  }
});

// Get single complaint by ID
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaint_id: req.params.id });
    
    if (!complaint) {
      return res.status(404).json({ 
        error: 'Complaint not found' 
      });
    }
    
    res.json({
      success: true,
      complaint: complaint
    });
    
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ 
      error: 'Failed to fetch complaint', 
      details: error.message 
    });
  }
});

// Update complaint status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, resolution_notes, assigned_to } = req.body;
    
    // Validate status
    const validStatuses = ['PENDING', 'REVIEWING', 'RESOLVED', 'ESCALATED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }
    
    const complaint = await Complaint.findOne({ complaint_id: req.params.id });
    
    if (!complaint) {
      return res.status(404).json({ 
        error: 'Complaint not found' 
      });
    }
    
    // Update fields
    if (status) complaint.status = status;
    if (resolution_notes) complaint.resolution_notes = resolution_notes;
    if (assigned_to) complaint.assigned_to = assigned_to;
    
    // Set resolved_at if status is RESOLVED
    if (status === 'RESOLVED' && !complaint.resolved_at) {
      complaint.resolved_at = Date.now();
    }
    
    await complaint.save();
    
    // Add status update to blockchain
    if (blockchainInstance && status) {
      try {
        blockchainInstance.addBlock({
          batchID: `COMPLAINT-UPDATE-${complaint.complaint_id}`,
          farmerID: complaint.user_id,
          location: 'Complaint System',
          temperature: 0,
          quantity: 0,
          handlerRole: 'Status Update',
          complaintId: complaint.complaint_id,
          newStatus: status,
          type: 'COMPLAINT_STATUS_UPDATE'
        });
      } catch (blockchainError) {
        console.error('Blockchain error:', blockchainError);
      }
    }
    
    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: complaint
    });
    
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ 
      error: 'Failed to update complaint', 
      details: error.message 
    });
  }
});

// Delete complaint (soft delete - change status to ARCHIVED)
router.delete('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaint_id: req.params.id });
    
    if (!complaint) {
      return res.status(404).json({ 
        error: 'Complaint not found' 
      });
    }
    
    // Instead of deleting, mark as archived
    complaint.status = 'ARCHIVED';
    await complaint.save();
    
    res.json({
      success: true,
      message: 'Complaint archived successfully'
    });
    
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ 
      error: 'Failed to delete complaint', 
      details: error.message 
    });
  }
});

// Get complaint statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'PENDING' });
    const reviewing = await Complaint.countDocuments({ status: 'REVIEWING' });
    const resolved = await Complaint.countDocuments({ status: 'RESOLVED' });
    const escalated = await Complaint.countDocuments({ status: 'ESCALATED' });
    
    const highPriority = await Complaint.countDocuments({ priority: 'HIGH' });
    const criticalPriority = await Complaint.countDocuments({ priority: 'CRITICAL' });
    
    res.json({
      success: true,
      statistics: {
        total,
        by_status: {
          pending,
          reviewing,
          resolved,
          escalated
        },
        high_priority: highPriority,
        critical_priority: criticalPriority,
        resolution_rate: total > 0 ? ((resolved / total) * 100).toFixed(2) + '%' : '0%'
      }
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics', 
      details: error.message 
    });
  }
});

module.exports = router;
