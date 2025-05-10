
const db = require("../models");
const ProductVersion = db.productVersions;

// Create and Save a new ProductVersion
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.version || !req.body.product_id || !req.body.release_date) {
      return res.status(400).json({ message: "Version, product_id, and release date are required" });
    }

    // Create a ProductVersion
    const productVersion = {
      product_id: req.body.product_id,
      version: req.body.version,
      release_date: new Date(req.body.release_date),
      notes: req.body.notes
    };

    // Save ProductVersion in the database
    const data = await ProductVersion.create(productVersion);
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Some error occurred while creating the Product Version."
    });
  }
};

// Retrieve all ProductVersions from the database (with optional product_id filter)
exports.findAll = async (req, res) => {
  const product_id = req.query.product_id;
  const condition = product_id ? { product_id: product_id } : null;

  try {
    const data = await ProductVersion.findAll({ where: condition });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
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
      return res.json(data);
    } else {
      return res.status(404).json({
        message: `ProductVersion with id=${id} was not found.`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error retrieving ProductVersion with id=${id}`
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

    if (num == 1) {
      return res.json({
        message: "ProductVersion was updated successfully."
      });
    } else {
      return res.status(404).json({
        message: `Cannot update ProductVersion with id=${id}. Maybe ProductVersion was not found or req.body is empty!`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error updating ProductVersion with id=${id}`
    });
  }
};

// Delete a ProductVersion with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await ProductVersion.destroy({
      where: { id: id }
    });

    if (num == 1) {
      return res.json({
        message: "ProductVersion was deleted successfully!"
      });
    } else {
      return res.status(404).json({
        message: `Cannot delete ProductVersion with id=${id}. Maybe ProductVersion was not found!`
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Could not delete ProductVersion with id=${id}`
    });
  }
};
