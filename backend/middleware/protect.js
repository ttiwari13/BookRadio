const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token." });
  }

  const token = authHeader.split(" ")[1];
   console.log(" Incoming Token:", token);
  console.log(" JWT_SECRET at verify:", process.env.JWT_SECRET);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next(); // move to next middleware/controller
  } catch (err) {
     console.error(" Token verification error:", err.message);
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = protect;
