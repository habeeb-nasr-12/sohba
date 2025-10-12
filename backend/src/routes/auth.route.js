import express from "express";
import passport from "../config/passport.js";
import {
  register,
  login,
  logout,
  refreshToken,
  googleCallback,
  getCurrentUser
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", register);
router.post("/signin", login);
router.post("/refresh", refreshToken);

// Google OAuth routes
router.get("/google", 
  (req, res, next) => {
    const mobile = req.query.mobile === 'true';
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      state: mobile ? 'mobile=true' : 'web',
      session: false
    })(req, res, next);
  }
);

router.get("/google/callback", 
  passport.authenticate("google", { 
    session: false,
    failureRedirect: '/api/auth/google/failure'
  }),
  googleCallback
);

// Google OAuth failure route
router.get("/google/failure", (req, res) => {
  const isMobile = req.query.state === 'mobile=true';
  
  if (isMobile) {
    const errorResponse = {
      success: false,
      message: "Google authentication failed. Please try again."
    };
    const encodedResponse = encodeURIComponent(JSON.stringify(errorResponse));
    return res.redirect(`sohba://auth/google/callback?response=${encodedResponse}`);
  }
  
  res.status(401).json({
    success: false,
    message: "Google authentication failed"
  });
});

// Protected routes
router.post("/logout", protectRoute, logout);
router.get("/me", protectRoute, getCurrentUser);

export default router;
