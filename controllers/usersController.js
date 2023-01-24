const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/Users.js");
const Task = require("../models/Task.js");

// async handler used to minimize try catch blocks

// GET all users
const getAllUsers = asyncHandler(async (req, res) => {});

// POST new user
const createNewUser = asyncHandler(async (req, res) => {});

// PATCH user
const updateUser = asyncHandler(async (req, res) => {});

// DELETE user
const deleteUser = asyncHandler(async (req, res) => {});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
