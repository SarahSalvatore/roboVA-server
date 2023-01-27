// async handler used to minimize try catch blocks
const asyncHandler = require("express-async-handler");
const User = require("../models/Users.js");
const Task = require("../models/Task.js");
const Client = require("../models/Clients.js");

// GET all clients
const getAllClients = asyncHandler(async (req, res) => {
  // return all clients - lean data only - do not need methods
  const clients = await Client.find().lean();
  // if no clients, send 400 status code and message
  if (!clients?.length) {
    return res.status(400).json({ message: "No clients found." });
  }
  // send 200 status code and clients
  return res.status(200).json(clients);
});

// POST new client
const createNewClient = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  // if no name, email or phone, send 400 status code and message
  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  // check if client already exists via email
  const duplicateEntry = await Client.findOne({
    email: email,
  })
    .lean()
    .exec();
  // if duplicate, send 409 status code and message
  if (duplicateEntry) {
    return res
      .status(409)
      .json({ message: `A client with the email ${email} already exists.` });
  }
  const client = {
    name: name,
    email: email,
    phone: phone,
    active: true,
  };
  // post new client
  const newClient = Client.create(client);
  // if client successfully created, send 201 status code and message
  if (newClient) {
    return res
      .status(201)
      .json({ message: `New client ${name} has been created.` });
  } else {
    // if unsuccessful, send 400 status code and message
    return res
      .status(400)
      .json({ message: "Something went wrong. Client could not be created." });
  }
});

// PATCH client
const updateClient = asyncHandler(async (req, res) => {
  const { id, name, email, phone, active } = req.body;
  // if no id, name, email, phone or activeStatus, send 400 status code and message
  if (!id || !name || !email || !phone || typeof active !== "boolean") {
    return res.status(400).json({ message: "Missing required fields." });
  }
  // using exec as per documentation as value is being passed in
  const client = await Client.findById(id).exec();
  // if user not found, send 400 status code and message
  if (!client) {
    return res.status(400).json({ message: "Client not found." });
  }
  // check if client already exists
  const duplicateEntry = await Client.findOne({ email }).lean().exec();
  // if duplicate, send 409 status code and message
  if (duplicateEntry && duplicateEntry._id.toString() !== id) {
    return res
      .status(409)
      .json({ message: `A client with the email ${email} already exists.` });
  }
  // update client data
  client.name = name;
  client.email = email;
  client.phone = phone;
  client.active = active;
  // calling save method to patch in new data - async handler will catch errors
  const updatedClient = await client.save();
  // return successful status code and message
  return res
    .status(200)
    .json({ message: `Client ${updatedClient.name} has been updated.` });
});

// DELETE client
const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.body;
  // if no id, send 400 status code and message
  if (!id) {
    return res.status(400).json({ message: "Missing client id." });
  }
  // check if client has assigned notes before allowing deletion
  const assignedTasks = await Task.findOne({ client: id, completed: false })
    .lean()
    .exec();

  if (assignedTasks) {
    return res.status(400).json({
      message: "This client has open tasks and cannot be deleted.",
    });
  }
  // find client - did not use lean() as need access to functions.
  const client = await Client.findById(id).exec();
  // if client not found, send 400 status code and message
  if (!client) {
    return res.status(400).json({ message: "Client not found." });
  }
  // delete client - result variable will contain the deleted client's information
  const result = await client.deleteOne();
  // if deleted, return successful message
  return res.status(200).json({
    message: `Client ${result.name} with id: ${result._id} has been deleted.`,
  });
});

module.exports = { getAllClients, createNewClient, updateClient, deleteClient };
