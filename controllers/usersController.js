const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/Users.js");
const Task = require("../models/Task.js");
const { findOne } = require("../models/Users.js");
const { use } = require("../routes/root.js");

// async handler used to minimize try catch blocks

// GET all users
const getAllUsers = asyncHandler(async (req, res) => {
  // return all users and omit password field - lean data only
  const users = await User.find().select("-password").lean();
  // if no users, send 400 status code and message
  if (!users) {
    return res.status(400).json({ message: "No users found." });
  }
  // send 200 status code and users
  return res.status(200).json(users);
});

// POST new user
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  // if no username, password or role, send 400 status code and message
  if (!username || !password || !roles.length) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  // check if user already exists (case insensitive)
  const duplicateEntry = await User.findOne({
    username: { $regex: username, $options: "i" },
  })
    .lean()
    .exec();
  // if duplicate, send 409 status code and message
  if (duplicateEntry) {
    return res.status(409).json({ message: "Username already exists." });
  }
  // hash password - 10 salt rounds
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    username: username,
    password: hashedPassword,
    roles: roles,
    active: true,
  };

  // post new user
  const newUser = User.create(user);

  // if user successfully created, send 201 status code and message
  if (newUser) {
    return res
      .status(201)
      .json({ message: `New user ${username} has been created.` });
  } else {
    // if unsuccessful, send 400 status code and message
    return res
      .status(400)
      .json({ message: "Something went wrong. User could not be created." });
  }
});

// PATCH user
const updateUser = asyncHandler(async (req, res) => {});

// DELETE user
const deleteUser = asyncHandler(async (req, res) => {});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
