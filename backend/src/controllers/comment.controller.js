import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import { getAuth } from "@clerk/express";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");
  res.status(200).json(comments);
});

export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content } = req.body;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);
  if (!user || !post) {
    return res.status(404).json({ message: "User or post not found" });
  }

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Comment Content is required" });
  }
  const session = await mongoose.startSession();
  let comment;

  try {
    session.startTransaction();

    // Create comment within transaction
    const commentData = [
      {
        user: user._id,
        post: postId,
        content,
      },
    ];
    const createdComments = await Comment.create(commentData, { session });
    comment = createdComments[0];

    // Update post with comment ID within transaction
    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment._id } },
      { session }
    );

    // Create notification if user is not the one who created the post
    if (post.user.toString() !== user._id.toString()) {
      await Notification.create(
        [
          {
            from: user._id,
            to: post.user,
            type: "comment",
            post: postId,
            comment: comment._id,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  res.status(201).json(comment);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;
  const user = await User.findOne({ clerkId: userId });
  const comment = await Comment.findById(commentId);
  if (!user || !comment) {
    return res.status(404).json({ message: "User or comment not found" });
  }
  if (comment.user.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this comment" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Remove comment from post's comments array within transaction
    await Post.findByIdAndUpdate(
      comment.post,
      { $pull: { comments: commentId } },
      { session }
    );

    // Delete the comment within transaction
    await Comment.findByIdAndDelete(commentId, { session });

    // Delete any notifications related to this comment within transaction
    await Notification.deleteMany({ comment: commentId }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  res.status(200).json({ message: "Comment deleted successfully" });
});
