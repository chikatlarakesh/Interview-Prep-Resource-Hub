// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Resource = require('../models/Resource'); 

// DELETE /api/admin/resource/:name - Delete resource by name (admin only)
router.delete('/resource/:name', protect, adminOnly, async (req, res) => {
  try {
    const resourceName = req.params.name;

    // Find resource by name
    const resource = await Resource.findOne({ name: resourceName });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Delete resource
    await Resource.deleteOne({ name: resourceName });

    res.status(200).json({ message: `Resource '${resourceName}' deleted successfully.` });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error while deleting resource' });
  }
});

module.exports = router;
