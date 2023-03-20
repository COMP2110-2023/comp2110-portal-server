const express = require('express');
const task = require('../controllers/task.js');

const router = express.Router();

router.get('/', task.getTasks );
router.post('/', task.createTask);
router.get('/:id', task.getTask);
router.post('/:id', task.updateTask);

module.exports = router;
