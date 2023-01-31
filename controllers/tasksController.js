// async handler used to minimize try catch blocks
const asyncHandler = require("express-async-handler");
const User = require("../models/Users.js");
const Task = require("../models/Task.js");
const Client = require("../models/Clients.js");

// GET all tasks
const getAllTasks = asyncHandler(async (req, res) => {
  // return all tasks - lean data only - do not need methods
  const tasks = await Task.find().lean();
  // if no tasks, send 400 status code and message
  if (!tasks?.length) {
    return res.status(400).json({ message: "No tasks found." });
  }

  // add the assigned user and client names to the task before sending back the response
  const taskListWithNames = await Promise.all(
    tasks.map(async (task) => {
      const user = await User.findById(task.user).lean().exec();
      const client = await Client.findById(task.client).lean().exec();
      return { ...task, user: user.username, client: client.name };
    })
  );

  // send 200 status code and users
  return res.status(200).json(taskListWithNames);
});

// POST new task
const createNewTask = asyncHandler(async (req, res) => {
  const { user, title, text, client } = req.body;
  // if no user, title, text or completion status, send 400 status code and message
  if (!user || !title || !text || !client) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  // check if task already exists
  const duplicateEntry = await Task.findOne({
    title,
    client,
  })
    .lean()
    .exec();
  // if duplicate, send 409 status code and message
  if (duplicateEntry) {
    return res.status(409).json({
      message: "A task with this title already exists for this client.",
    });
  }
  // create and store the new task
  const newTask = await Task.create({ user, title, text, client });
  // if task successfully created, send 201 status code and message
  if (newTask) {
    return res
      .status(201)
      .json({ message: `New task for ${newTask.client} has been created.` });
  } else {
    // if unsuccessful, send 400 status code and message
    return res
      .status(400)
      .json({ message: "Something went wrong. Task could not be created." });
  }
});

// PATCH task
const updateTask = asyncHandler(async (req, res) => {
  const { id, user, title, text, client, completed } = req.body;
  // if no id, user, title, text, client or completionStatus, send 400 status code and message
  if (
    !id ||
    !user ||
    !title ||
    !text ||
    !client ||
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  // using exec as per documentation as value is being passed in
  const task = await Task.findById(id).exec();
  // if task not found, send 400 status code and message
  if (!task) {
    return res.status(400).json({ message: "Task not found." });
  }
  // check if duplicate task already exists
  const duplicateEntry = await Task.findOne({ title, client }).lean().exec();
  // if duplicate, send 409 status code and message
  if (duplicateEntry && duplicateEntry._id.toString() !== id) {
    return res.status(409).json({
      message: "A task with this title already exists for this client.",
    });
  }
  // update task data
  task.user = user;
  task.title = title;
  task.text = text;
  task.client = client;
  task.completed = completed;

  // calling save method to patch in new data - async handler will catch errors
  const updatedTask = await task.save();
  // return successful status code and message
  return res
    .status(200)
    .json({ message: `Task ${updatedTask._id} has been updated.` });
});

// DELETE task
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.body;
  // if no id, send 400 status code and message
  if (!id) {
    return res.status(400).json({ message: "Missing task id." });
  }
  // find task - did not use lean() as need access to functions.
  const task = await Task.findById(id).exec();
  // if task not found, send 400 status code and message
  if (!task) {
    return res.status(400).json({ message: "Task not found." });
  }
  // delete task - result variable will contain the deleted task's information
  const result = await task.deleteOne();
  // if deleted, return successful message
  return res.status(200).json({
    message: `Task ${result._id} has been deleted.`,
  });
});

module.exports = { getAllTasks, createNewTask, updateTask, deleteTask };
