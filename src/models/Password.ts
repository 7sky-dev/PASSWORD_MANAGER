import mongoose from "mongoose";

const PasswordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: ["personal", "work", "finance", "device"],
      default: "personal",
    },
    strength: {
      type: String,
      enum: ["weak", "medium", "strong"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

PasswordSchema.index({ userId: 1, createdAt: -1 });

export const Password =
  mongoose.models.Password || mongoose.model("Password", PasswordSchema);
