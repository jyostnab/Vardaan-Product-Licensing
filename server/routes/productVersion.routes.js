
module.exports = app => {
  const productVersions = require("../controllers/productVersion.controller.js");
  const router = require("express").Router();

  // Create a new Product Version
  router.post("/", productVersions.create);

  // Retrieve all Product Versions
  router.get("/", productVersions.findAll);

  // Retrieve Product Versions by product id
  router.get("/by-product/:productId", productVersions.findByProductId);

  // Retrieve a single Product Version with id
  router.get("/:id", productVersions.findOne);

  // Update a Product Version with id
  router.put("/:id", productVersions.update);

  // Delete a Product Version with id
  router.delete("/:id", productVersions.delete);

  app.use("/api/productVersions", router);
};
