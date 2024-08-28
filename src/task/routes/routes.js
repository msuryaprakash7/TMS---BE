const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task-controller');
const authorizeRole = require('../../auth/middleware/roleAuthorization');

router.post('/', authorizeRole("user"), taskController.createTask);
router.get('/', authorizeRole("user"), taskController.getTasks);
router.put('/:id', authorizeRole("user"), taskController.updateTask);
router.delete('/:id', authorizeRole("user"), taskController.deleteTask);

module.exports = router;
