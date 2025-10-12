import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});

export const updatProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});

// Note: syncUser is no longer needed with JWT auth
// User creation is handled in auth controller during registration
export const syncUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({
    message: "User sync successful",
    user: user,
  });
});


export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});

export const followUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { targetUserId } = req.params;
  
    if (userId === targetUserId) return res.status(400).json({ error: "You cannot follow yourself" });
  
    const currentUser = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);
  
    if (!currentUser || !targetUser) return res.status(404).json({ error: "User not found" });
  
    const isFollowing = currentUser.following.includes(targetUserId);
  
    if (isFollowing) {
      // unfollow
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUser._id },
      });
    } else {
      // follow
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $push: { followers: currentUser._id },
      });
  
      // create notification
      await Notification.create({
        from: currentUser._id,
        to: targetUserId,
        type: "follow",
      });
    }
  
    res.status(200).json({
      message: isFollowing ? "User unfollowed successfully" : "User followed successfully",
    });
  });