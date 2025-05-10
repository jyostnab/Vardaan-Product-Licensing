
const db = require("../models");
const User = db.users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new user
exports.register = async (req, res) => {
  try {
    // Validate request
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({
        message: "Username, email, and password are required!"
      });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists!"
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || 'user'
    });

    // Return the created user (without password)
    const { password, ...userWithoutPassword } = user.get({ plain: true });
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Some error occurred while registering the user."
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // Validate request
    if (!req.body.username && !req.body.email) {
      return res.status(400).json({
        message: "Username or email is required!"
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        message: "Password is required!"
      });
    }

    // Find the user by username or email
    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: req.body.username || "" },
          { email: req.body.email || "" }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found!"
      });
    }

    // Check the password
    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid password!"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "vardaan-licensing-secret",
      { expiresIn: "24h" }
    );

    // Return token and user info
    const { password, ...userWithoutPassword } = user.get({ plain: true });
    return res.json({
      user: userWithoutPassword,
      token: token
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Some error occurred while logging in."
    });
  }
};

// Check auth status (requires auth middleware)
exports.checkAuth = (req, res) => {
  return res.json({
    message: "Authenticated",
    user: req.user
  });
};
