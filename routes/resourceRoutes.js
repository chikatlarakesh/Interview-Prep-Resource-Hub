const express = require('express');
const { getResources,searchResources } = require('../controllers/resourceController');

const router = express.Router();

router.get('/resources', getResources);
router.get('/resources/search', searchResources);

module.exports = router;
