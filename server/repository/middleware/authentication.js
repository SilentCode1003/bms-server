const jwt = require("jsonwebtoken");

const verifyjwt = (req, res, next) => {
  // First check for token in Authorization header (for API requests)
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    if (
      process.env.PROJECT_AUTHORIZATION_TOKEN &&
      token === process.env.PROJECT_AUTHORIZATION_TOKEN
    ) {
      req.user = {
        mu_id: null,
        mu_username: "project-api",
        mu_fullname: "Project API Token",
        mu_access: ["api"],
        mu_status: "authorized",
      };
      return next();
    }

    try {
      const decoded = jwt.verify(token, "5L Secret Key");

      // Set user from token payload
      req.user = {
        mu_id: decoded.id || decoded.mu_id,
        mu_username: decoded.username || decoded.mu_username,
        mu_fullname: decoded.fullname || decoded.mu_fullname,
        mu_access: decoded.access || decoded.mu_access,
        mu_status: decoded.status || decoded.mu_status,
      };
      return next();
    } catch (error) {
      console.error("JWT verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: error.message,
      });
    }
  }

  // Fall back to session check (for web interface)
  if (req.session && req.session.jwt) {
    try {
      const token = req.session.jwt;
      const decoded = jwt.verify(token, "5L Secret Key");
      req.user = {
        mu_id: req.session.user?.mu_id || decoded.id,
        mu_username: req.session.user?.mu_username || decoded.username,
        mu_fullname: req.session.user?.mu_fullname || decoded.fullname,
        mu_access: req.session.user?.mu_access || decoded.access,
        mu_status: req.session.user?.mu_status || decoded.status,
      };
      return next();
    } catch (error) {
      console.error("Session token error:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
        error: error.message,
      });
    }
  }

  // No valid authentication found
  if (req.accepts("html")) {
    return res.redirect("/unauthorized");
  } else {
    return res.status(401).json({ message: "Authentication required" });
  }
};

module.exports = verifyjwt;
