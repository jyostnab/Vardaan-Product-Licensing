
module.exports = app => {
  const licenses = require("../controllers/license.controller.js");
  const router = require("express").Router();

  // Create a new License
  router.post("/", licenses.create);

  // Retrieve all Licenses
  router.get("/", licenses.findAll);

  // Retrieve a single License with id
  router.get("/:id", licenses.findOne);

  // Update a License with id
  router.put("/:id", licenses.update);

  // Delete a License with id
  router.delete("/:id", licenses.delete);
  
  // Verify a License
  router.post("/verify", licenses.verifyLicense);
  
  // Get verification logs for a license
  router.get("/:id/logs", licenses.getVerificationLogs);

  app.use("/api/licenses", router);
};
