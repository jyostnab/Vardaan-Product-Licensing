
const db = require("../models");
const Product = db.products;
const ProductVersion = db.productVersions;

// Create and Save a new Product
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    // Create a Product
    const product = {
      name: req.body.name,
      description: req.body.description
    };

    // Save Product in the database
    const data = await Product.create(product);
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Some error occurred while creating the Product."
    });
  }
};

// Retrieve all Products from the database
exports.findAll = async (req, res) => {
  try {
    const data = await Product.findAll({
      include: [
        {
          model: ProductVersion,
          as: "versions",
          attributes: ["id", "version", "release_date", "notes"]
        }
      ]
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Some error occurred while retrieving products."
    });
  }
};

// Find a single Product with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Product.findByPk(id, {
      include: [
        {
          model: ProductVersion,
          as: "versions",
          attributes: ["id", "version", "release_date", "notes"]
        }
      ]
    });
    if (data) {
      return res.json(data);
    } else {
      return res.status(404).json({
        message: `Product with id=${id} was not found.`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error retrieving Product with id=${id}`
    });
  }
};

// Update a Product by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Product.update(req.body, {
      where: { id: id }
    });

    if (num == 1) {
      return res.json({
        message: "Product was updated successfully."
      });
    } else {
      return res.status(404).json({
        message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error updating Product with id=${id}`
    });
  }
};

// Delete a Product with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Product.destroy({
      where: { id: id }
    });

    if (num == 1) {
      return res.json({
        message: "Product was deleted successfully!"
      });
    } else {
      return res.status(404).json({
        message: `Cannot delete Product with id=${id}. Maybe Product was not found!`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Could not delete Product with id=${id}`
    });
  }
};
