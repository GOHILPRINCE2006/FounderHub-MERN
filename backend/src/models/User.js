const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
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
      select: false,
    },
    role: {
      type: String,
      enum: ["founder", "developer", "mentor", "investor", "admin"],
      required: [true, "Role is required"],
    },
    avatar: { type: String, default: "" },

    // --- Common profile ---
    phone: {
      type: String,
      default: "",
      trim: true,
      unique: true,
      sparse: true,
    },
    location: { type: String, default: "", trim: true },
    github:   { type: String, default: "", trim: true },
    linkedin: { type: String, default: "", trim: true },
    website:  { type: String, default: "", trim: true },
    portfolioLinks: { type: [String], default: [] },

    skills:     { type: [String], default: [] },
    experience: { type: String, default: "" },
    about:      { type: String, default: "" },

    // --- Developer ---
    availability: {
      type: String,
      enum: ["", "Full-time", "Part-time", "Internship"],
      default: "",
    },

    // --- Mentor ---
    expertise:         { type: String, default: "", trim: true },
    yearsOfExperience: { type: Number, default: 0, min: 0 },
    currentRole:       { type: String, default: "", trim: true },
    // Price per session in INR. Only meaningful for mentors.
    sessionPrice:      { type: Number, default: 0, min: 0 },

    // --- Mentor + Investor shared ---
    company: { type: String, default: "", trim: true },

    // --- Investor ---
    investmentFocus: { type: String, default: "", trim: true },
    ticketSize:      { type: String, default: "", trim: true },

    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);