
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
  
  // Update user count for a license
  router.put("/:id/user-count", licenses.updateUserCount);
  
  // Get verification logs for a license
  router.get("/:id/logs", licenses.getVerificationLogs);

  // Check a license's status
  router.get("/:id/status", licenses.getLicenseStatus);

  // Generate a new license key
  router.post("/generate-key", licenses.generateLicenseKey);
  
  // Validate a license key from external system
  router.post("/validate-key", licenses.validateLicenseKey);
  
  // Get license by key
  router.get("/by-key/:key", licenses.getLicenseByKey);

  app.use("/api/licenses", router);
};
