const express = require("express");
const router = express.Router();
const {
  getAllTasks,
  createNewTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasksController.js");

router
  .route("/")
  .get(getAllTasks)
  .post(createNewTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
