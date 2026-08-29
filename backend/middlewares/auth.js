import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Authentication middleware
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Get secret HERE, when the request comes
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return res.status(500).json({
        success: false,
        message: "JWT secret is not configured",
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);

    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
}


// Admin-only middleware
export function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}

export { authMiddleware };
export default authMiddleware;