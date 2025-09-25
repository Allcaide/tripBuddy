const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// API routes (não view routes!)

router.get('/api/tours', viewsController.getOverview);
router.get('/api/tours/:id', viewsController.getTour);

module.exports = router;
