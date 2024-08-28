const HttpStatusCodes = require('../../shared/utils/http-codes');
const formatResponse = require('../../shared/utils/responseFormatter');
const taskService = require('../services/task-services');

const createTask = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const userId = req.id; // Assuming `req.id` contains the user ID

    if (!title || !description) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json(
        formatResponse(
          HttpStatusCodes.BAD_REQUEST,
          'error',
          'Invalid data',
          'Title and description are required'
        )
      );
    }

    const task = await taskService.createTask({ title, description, type, userId });
    res.status(HttpStatusCodes.CREATED).json(
      formatResponse(
        HttpStatusCodes.CREATED,
        'success',
        'Task created successfully',
        'Task created successfully and saved into db',
        task
      )
    );
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'error',
        'Task creation failed',
        error.message
      )
    );
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.id; // Assuming `req.id` contains the user ID

    const tasks = await taskService.getTasks(userId);
    res.status(HttpStatusCodes.OK).json(
      formatResponse(
        HttpStatusCodes.OK,
        'success',
        'Tasks retrieved successfully',
        null,
        tasks
      )
    );
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'error',
        'Failed to retrieve tasks',
        error.message
      )
    );
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const taskData = req.body;
    const userId = req.id; // Assuming `req.id` contains the user ID

    const updatedTask = await taskService.updateTask(taskId, userId, taskData);
    if (!updatedTask) {
      return res.status(HttpStatusCodes.NOT_FOUND).json(
        formatResponse(
          HttpStatusCodes.NOT_FOUND,
          'error',
          'Task not found',
          `No task found with id ${taskId}`
        )
      );
    }

    res.status(HttpStatusCodes.OK).json(
      formatResponse(
        HttpStatusCodes.OK,
        'success',
        'Task updated successfully',
        null,
        updatedTask
      )
    );
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'error',
        'Task update failed',
        error.message
      )
    );
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.id; // Assuming `req.id` contains the user ID

    const deletedTask = await taskService.deleteTask(taskId, userId);
    if (!deletedTask) {
      return res.status(HttpStatusCodes.NOT_FOUND).json(
        formatResponse(
          HttpStatusCodes.NOT_FOUND,
          'error',
          'Task not found',
          `No task found with id ${taskId}`
        )
      );
    }

    res.status(HttpStatusCodes.OK).json(
      formatResponse(
        HttpStatusCodes.OK,
        'success',
        'Task deleted successfully',
        null,
        deletedTask
      )
    );
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'error',
        'Task deletion failed',
        error.message
      )
    );
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
