
const db = require("../models");
const Customer = db.customers;

// Create and Save a new Customer
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    // Create a Customer
    const customer = {
      name: req.body.name,
      location: req.body.location,
      country: req.body.country,
      contact: req.body.contact,
      mobile: req.body.mobile,
      email: req.body.email
    };

    // Save Customer in the database
    const data = await Customer.create(customer);
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Some error occurred while creating the Customer."
    });
  }
};

// Retrieve all Customers from the database
exports.findAll = async (req, res) => {
  try {
    const data = await Customer.findAll();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Some error occurred while retrieving customers."
    });
  }
};

// Find a single Customer with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Customer.findByPk(id);
    if (data) {
      return res.json(data);
    } else {
      return res.status(404).json({
        message: `Customer with id=${id} was not found.`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error retrieving Customer with id=${id}`
    });
  }
};

// Update a Customer by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Customer.update(req.body, {
      where: { id: id }
    });

    if (num == 1) {
      return res.json({
        message: "Customer was updated successfully."
      });
    } else {
      return res.status(404).json({
        message: `Cannot update Customer with id=${id}. Maybe Customer was not found or req.body is empty!`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error updating Customer with id=${id}`
    });
  }
};

// Delete a Customer with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Customer.destroy({
      where: { id: id }
    });

    if (num == 1) {
      return res.json({
        message: "Customer was deleted successfully!"
      });
    } else {
      return res.status(404).json({
        message: `Cannot delete Customer with id=${id}. Maybe Customer was not found!`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Could not delete Customer with id=${id}`
    });
  }
};
