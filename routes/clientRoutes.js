const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getAllClients,
  createNewClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController.js");

// Adds middleware to all routes inside file
router.use(verifyToken);

router
  .route("/")
  .get(getAllClients)
  .post(createNewClient)
  .patch(updateClient)
  .delete(deleteClient);

module.exports = router;
