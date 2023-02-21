const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const verifyToken = (req, res, next) => {
  // make sure auth header exists (lowercase or uppercase)
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decoded.UserInfo.username;
      req.roles = decoded.UserInfo.roles;
      next();
    })
  );
};

module.exports = verifyToken;
