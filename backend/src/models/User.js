const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // password won't be returned in queries by default
    },
    role: {
      type: String,
      enum: ["founder", "developer", "mentor", "investor", "admin"],
      required: [true, "Role is required"],
    },
    avatar: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false, // used for mentor/investor verification later
    },
    isActive: {
      type: Boolean,
      default: true, // used for admin block/deactivate later
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);