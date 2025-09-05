import express from "express";
import {
  getUserProfile,
  updatProfile,
  syncUser,
  getCurrentUser,
  followUser,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

//PUBLIC ROUTES
router.get("/profile/:username", getUserProfile);

//PRIVATE ROUTES
router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.put("/profile", protectRoute, updatProfile);
router.post("/follow/:targetUserId", protectRoute, followUser);

export default router;
