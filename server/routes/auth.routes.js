
module.exports = app => {
  const auth = require("../controllers/auth.controller.js");
  const { authJwt } = require("../middleware");
  const router = require("express").Router();

  // Register a new user
  router.post("/register", auth.register);

  // Login
  router.post("/login", auth.login);

  // Check authentication status (requires auth)
  router.get("/me", [authJwt.verifyToken], auth.checkAuth);

  app.use("/api/auth", router);
};
