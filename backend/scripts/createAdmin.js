// Creates (or resets the password of) an admin account.
// Usage:  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=StrongPass123 ADMIN_NAME="Admin" npm run seed:admin
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

(async () => {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Admin";
  if (!email || password.length < 8) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars).");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  let user = await User.findOne({ email }).select("+password");
  if (user) {
    user.role = "admin";
    user.password = password; // hashed by the pre-save hook
    user.isActive = true;
  } else {
    user = new User({ name, email, password, role: "admin", isActive: true });
  }
  await user.save();
  console.log(`Admin ready: ${email}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
