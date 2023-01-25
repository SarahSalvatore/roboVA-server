// async handler used to minimize try catch blocks
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/Users.js");
const Task = require("../models/Task.js");

// GET all users
const getAllUsers = asyncHandler(async (req, res) => {
  // return all users and omit password field - lean data only - do not need methods
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
  if (!username || !password || !roles?.length) {
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
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, roles, active } = req.body;
  // if no id, username, role, or activeStatus, send 400 status code and message (password optional)
  if (
    !id ||
    !username ||
    !roles?.length ||
    !active ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  // using exec as per documentation as value is being passed in
  const user = await User.findById(id).exec();
  // if user not found, send 400 status code and message
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }
  // update user data
  user.username = username;
  user.roles = roles;
  user.active = active;
  // if password was provided in req.body, hash password (won't always be passed in. optional)
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  // calling save method to patch in new data - async handler will catch errors
  const updatedUser = await user.save();
  // return successful status code and message
  return res
    .status(200)
    .json({ message: `User ${updatesUser.username} has been updated.` });
});

// DELETE user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  // if no id, send 400 status code and message
  if (!id) {
    return res.status(400).json({ message: "Missing user id." });
  }
  // check if user has assigned notes before allowing deletion
  const assignedTasks = await Task.findOne({ user: id }).lean().exec();

  if (assignedTasks?.length) {
    return res.status(400).json({
      message: "A user with assigned tasks cannot be deleted.",
    });
  }
  // find user - did not use lean() as need access to functions.
  const user = await User.findById(id).exec();

  // if user not found, send 400 status code and message
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }
  // delete user - result variable will contain the deleted user's information
  const result = await user.deleteOne();
  // if deleted, return successful message
  return res.status(200).json({
    message: `User ${result.username} with id: ${result._id} has been deleted.`,
  });
});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
