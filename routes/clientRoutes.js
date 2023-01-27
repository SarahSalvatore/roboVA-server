const express = require("express");
const router = express.Router();
const {
  getAllClients,
  createNewClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController.js");

router
  .route("/")
  .get(getAllClients)
  .post(createNewClient)
  .patch(updateClient)
  .delete(deleteClient);

module.exports = router;
