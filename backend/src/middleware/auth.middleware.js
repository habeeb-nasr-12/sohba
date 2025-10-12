import asyncHandler from "express-async-handler";
import { extractToken, verifyToken } from "../utils/auth.js";
import User from "../models/user.model.js";

export const protectRoute = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ 
      message: "Access token required" 
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        message: "User not found" 
      });
    }

    // Add user to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      authProvider: user.authProvider
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      message: "Invalid or expired token" 
    });
  }
});
