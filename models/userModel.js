import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    answer: { type: String, required: true },
    role: { type: String, default: "customer" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
