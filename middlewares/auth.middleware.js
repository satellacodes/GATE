const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const db = require("../models");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await db.Admin.findByPk(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = admin;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
