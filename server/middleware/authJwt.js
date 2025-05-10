
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.users;

verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      message: "No token provided!"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || "vardaan-licensing-secret", async (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Unauthorized!"
      });
    }

    // Find user by ID from the token
    try {
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(404).json({
          message: "User not found!"
        });
      }

      // Add user info to request object
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      return res.status(500).json({
        message: "Could not validate the token: " + error.message
      });
    }
  });
};

isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
    return;
  }

  res.status(403).json({
    message: "Require Admin Role!"
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin
};

module.exports = authJwt;
