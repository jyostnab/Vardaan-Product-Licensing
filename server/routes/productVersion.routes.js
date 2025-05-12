
module.exports = app => {
  const productVersions = require("../controllers/productVersion.controller.js");
  const router = require("express").Router();
  
  // Create a new product version
  router.post("/", productVersions.create);
  
  // Retrieve all product versions
  router.get("/", productVersions.findAll);
  
  // Retrieve product versions by product ID
  router.get("/by-product/:productId", productVersions.findByProductId);
  
  // Retrieve a single product version with id
  router.get("/:id", productVersions.findOne);
  
  // Update a product version with id
  router.put("/:id", productVersions.update);
  
  // Delete a product version with id
  router.delete("/:id", productVersions.delete);
  
  app.use("/api/productVersions", router);
};
