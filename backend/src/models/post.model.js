import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: false, maxLength: 1000, default: "" },
    files: [{
      url: { type: String, default: "" },
      type: { type: String, enum: ["image", "video", "pdf"], default: "" },
      filename: { type: String, default: "" },
      size: { type: Number, default: 0 },
      mimetype: { type: String, default: "" },
      cloudinaryId: { type: String, default: "" } // Store Cloudinary public_id for potential deletion
    }],
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
      default: [],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
