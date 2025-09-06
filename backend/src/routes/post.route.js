import express from "express";
import { getPosts, getPost, getUserPosts, createPost, deletePost, likePost } from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload, validateFileSize } from "../middleware/upload.middleware.js";

const router = express.Router();

//PUBLIC ROUTES
router.get("/", getPosts);
router.get("/:postId", getPost);
router.get("/user/:username", getUserPosts);

//PRIVATE ROUTES
router.post("/", protectRoute, upload.array("files", 10), validateFileSize, createPost);
router.like("/:postId/like", protectRoute, likePost);
router.delete("/:postId", protectRoute, deletePost);