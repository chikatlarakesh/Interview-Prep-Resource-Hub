const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { fetchGitHubResources } = require('../utils/githubFetcher');

router.get('/', async (req, res) => {
  try {
    const resources = await fetchGitHubResources();
    res.json(resources);
  } catch (error) {
    console.error('Error fetching GitHub resources:', error.message);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
});

module.exports = router;
