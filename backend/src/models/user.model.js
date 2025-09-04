import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    profilePicture: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    bio : { type: String, default: "" , maxLength: 160},
    location: { type: String, default: "" },
    followers: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    following: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
