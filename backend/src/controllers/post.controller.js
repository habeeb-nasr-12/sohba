import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";
import Comment from "../models/comment.model.js";
import Notification from "../models/notification.model.js";

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  res.status(200).json({ posts });
});

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId)
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });
  if (!post) {
    res.status(200).json({ message: "Post not found" });
  }

  res.status(200).json({ post });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    res.status(200).json({ message: "User not found" });
  }
  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });
  res.status(200).json({ posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { content } = req.body;
  const files = req.files || [];

  if (!content && files.length === 0) {
    return res.status(400).json({
      message: "Content or files are required when creating a post",
    });
  }

  let uploadedFiles = [];

  // Upload files to Cloudinary if any files are provided
  if (files.length > 0) {
    try {
      for (const file of files) {
        let resourceType = "auto";
        let fileType = "";

        // Determine file type and resource type for Cloudinary
        if (file.mimetype.startsWith("image/")) {
          resourceType = "image";
          fileType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          resourceType = "video";
          fileType = "video";
        } else if (file.mimetype === "application/pdf") {
          resourceType = "raw";
          fileType = "pdf";
        }

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: resourceType,
              folder: "posts", // Organize uploads in a 'posts' folder
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        // Store file information
        uploadedFiles.push({
          url: uploadResult.secure_url,
          type: fileType,
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          cloudinaryId: uploadResult.public_id, // Store for potential deletion later
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Failed to upload files",
        error: error.message,
      });
    }
  }

  // Create the post with uploaded file URLs
  const post = await Post.create({
    user: userId,
    content,
    files: uploadedFiles,
  });

  // Populate the user information before sending response
  await post.populate("user", "username firstName lastName profilePicture");

  res.status(201).json({
    message: "Post created successfully",
    post,
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Check if the user owns the post
  if (post.user.toString() !== userId) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this post" });
  }

  // Delete files from Cloudinary if they exist
  if (post.files && post.files.length > 0) {
    try {
      for (const file of post.files) {
        if (file.cloudinaryId) {
          await cloudinary.uploader.destroy(file.cloudinaryId, {
            resource_type:
              file.type === "video"
                ? "video"
                : file.type === "pdf"
                ? "raw"
                : "image",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting files from Cloudinary:", error);
      // Continue with post deletion even if file deletion fails
    }
  }

  await Comment.deleteMany({ post: postId });
  await Post.findByIdAndDelete(postId);

  res.status(200).json({
    message: "Post deleted successfully",
  });
});

export const likePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const user = await User.findById(userId);
  const post = await Post.findById(postId);
  if (!user || !post) {
    return res.status(404).json({ message: "User or post not found" });
  }
  const isLiked = post.likes.includes(userId);
  if (isLiked) {
    await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
  } else {
    await Post.findByIdAndUpdate(postId, { $push: { likes: userId } });
  }
  if (post.user.toString() !== userId) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "like",
      post: postId,
    });
  }
  res.status(200).json({
    message: isLiked ? "Post unliked successfully" : "Post liked successfully",
  });
});
