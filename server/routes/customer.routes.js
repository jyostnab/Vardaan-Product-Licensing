
module.exports = app => {
  const customers = require("../controllers/customer.controller.js");
  const router = require("express").Router();

  // Create a new Customer
  router.post("/", customers.create);

  // Retrieve all Customers
  router.get("/", customers.findAll);

  // Retrieve a single Customer with id
  router.get("/:id", customers.findOne);

  // Update a Customer with id
  router.put("/:id", customers.update);

  // Delete a Customer with id
  router.delete("/:id", customers.delete);

  app.use("/api/customers", router);
};
