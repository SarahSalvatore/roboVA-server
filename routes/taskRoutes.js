const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getAllTasks,
  createNewTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasksController.js");

// Adds middleware to all routes inside file
router.use(verifyToken);

router
  .route("/")
  .get(getAllTasks)
  .post(createNewTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
