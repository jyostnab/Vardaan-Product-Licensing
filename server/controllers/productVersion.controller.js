
const db = require("../models");
const ProductVersion = db.productVersions;
const Product = db.products;
const { Op } = require("sequelize");

// Create and Save a new ProductVersion
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.product_id || !req.body.version || !req.body.release_date) {
      return res.status(400).json({ 
        message: "Product ID, version and release date are required" 
      });
    }

    // Create a ProductVersion
    const productVersion = {
      product_id: req.body.product_id,
      version: req.body.version,
      release_date: req.body.release_date,
      notes: req.body.notes
    };

    // Save ProductVersion in the database
    const data = await ProductVersion.create(productVersion);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the Product Version."
    });
  }
};

// Retrieve all ProductVersions from the database
exports.findAll = async (req, res) => {
  try {
    const data = await ProductVersion.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving product versions."
    });
  }
};

// Find a single ProductVersion with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await ProductVersion.findByPk(id);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({
        message: `Cannot find Product Version with id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: `Error retrieving Product Version with id=${id}.`
    });
  }
};

// Find ProductVersions by product id
exports.findByProductId = async (req, res) => {
  const productId = req.params.productId;

  try {
    const data = await ProductVersion.findAll({
      where: { product_id: productId }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving Product Versions for product id=${productId}.`
    });
  }
};

// Update a ProductVersion by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await ProductVersion.update(req.body, {
      where: { id: id }
    });

    if (num[0] === 1) {
      res.json({
        message: "Product Version was updated successfully."
      });
    } else {
      res.status(404).json({
        message: `Cannot update Product Version with id=${id}. Maybe Product Version was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: `Error updating Product Version with id=${id}.`
    });
  }
};

// Delete a ProductVersion with the specified id
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await ProductVersion.destroy({
      where: { id: id }
    });

    if (num === 1) {
      res.json({
        message: "Product Version was deleted successfully!"
      });
    } else {
      res.status(404).json({
        message: `Cannot delete Product Version with id=${id}. Maybe Product Version was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: `Could not delete Product Version with id=${id}.`
    });
  }
};
