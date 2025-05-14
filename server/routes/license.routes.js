const db = require("../models");

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

  app.use("/api/licenses", router);
};
