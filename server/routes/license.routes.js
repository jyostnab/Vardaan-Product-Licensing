const db = require("../models");
const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

module.exports = app => {
  const licenses = require("../controllers/license.controller.js");

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

  // New endpoint
  router.post('/customers-by-product', async (req, res) => {
    const { productName, version } = req.body;
    if (!productName || !version) {
      return res.status(400).json({ message: "Missing productName or version" });
    }

    try {
      const product = await db.Product.findOne({ where: { name: productName } });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const productVersion = await db.ProductVersion.findOne({
        where: { product_id: product.id, version }
      });
      if (!productVersion) {
        return res.status(404).json({ message: "Product version not found" });
      }

      const licenses = await db.License.findAll({
        where: {
          product_id: product.id,
          product_version_id: productVersion.id,
          // Add your own logic for "valid" (not expired, not revoked, etc.)
        },
        include: [{ model: db.Customer, as: 'customer' }]
      });

      const customers = licenses
        .map(lic => lic.customer)
        .filter(Boolean)
        .map(cust => ({
          id: cust.id,
          name: cust.name,
          email: cust.email,
        }));

      res.json(customers);
    } catch (err) {
      console.error("Error in /customers-by-product:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // License verification API endpoint
  router.post('/verify', async (req, res) => {
    try {
      const { licenseKey } = req.body;
      
      if (!licenseKey) {
        return res.status(400).json({
          valid: false,
          message: "License key is required",
          details: { error: "Missing license key" }
        });
      }

      // Two implementation options:
      
      // Option 1: Call Python script (recommended for complex verification)
      const result = await callPythonVerifier(licenseKey);
      return res.json(result);
      
      // Option 2: Use built-in JS verification (simpler but less powerful)
      // const result = verifyLicenseJS(licenseKey);
      // return res.json(result);
      
    } catch (error) {
      console.error("License verification error:", error);
      return res.status(500).json({
        valid: false,
        message: "Internal server error during license verification",
        details: { error: error.message }
      });
    }
  });

  // Call Python script for verification
  async function callPythonVerifier(licenseKey, addUser = false) {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '..', 'scripts', 'verify_license.py');
      const pythonProcess = spawn('python', [pythonScript, licenseKey, addUser ? 'add-user' : 'verify']);
      
      let resultData = '';
      let errorData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error: ${errorData}`);
          return reject(new Error(`Verification script failed with code ${code}`));
        }
        
        try {
          const result = JSON.parse(resultData);
          resolve(result);
        } catch (err) {
          reject(new Error(`Failed to parse verification result: ${err.message}`));
        }
      });
    });
  }

  // Add endpoint to add a user (increment user count)
  router.post('/add-user', async (req, res) => {
    try {
      const { licenseKey } = req.body;
      
      if (!licenseKey) {
        return res.status(400).json({
          success: false,
          message: "License key is required"
        });
      }
      
      // Call Python script with add-user flag
      const result = await callPythonVerifier(licenseKey, true);
      
      return res.json({
        success: result.valid,
        message: result.message,
        details: result.details
      });
      
    } catch (error) {
      console.error("Add user error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while adding user",
        error: error.message
      });
    }
  });

  app.use("/api/licenses", router);
};
