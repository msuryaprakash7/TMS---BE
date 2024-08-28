const Task = require("../models/task");

const createTask = async (taskData) => {
  try {
    const task = new Task(taskData);
    await task.save();
    return task;
  } catch (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }
};

const getTasks = async (userId) => {
  try {
    return await Task.find({ userId, isDeleted: false });
  } catch (error) {
    throw new Error(`Failed to retrieve tasks: ${error.message}`);
  }
};

const updateTask = async (taskId, userId, taskData) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $set: taskData },
      { new: true, runValidators: true }
    );
    return task;
  } catch (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }
};

const deleteTask = async (taskId, userId) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { isDeleted: true },
      { new: true }
    );
    return task;
  } catch (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
