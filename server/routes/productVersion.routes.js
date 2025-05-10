
module.exports = app => {
  const productVersions = require("../controllers/productVersion.controller.js");
  const router = require("express").Router();

  // Create a new ProductVersion
  router.post("/", productVersions.create);

  // Retrieve all ProductVersions
  router.get("/", productVersions.findAll);

  // Retrieve a single ProductVersion with id
  router.get("/:id", productVersions.findOne);

  // Update a ProductVersion with id
  router.put("/:id", productVersions.update);

  // Delete a ProductVersion with id
  router.delete("/:id", productVersions.delete);

  app.use("/api/product-versions", router);
};
