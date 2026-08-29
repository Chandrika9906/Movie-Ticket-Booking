// make-admin.js
// Promotes one account to admin role by email.
// Run: node make-admin.js youremail@example.com

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/userModel.js";

dotenv.config({ override: true });

const email = process.argv[2];
if (!email) {
  console.error("Usage: node make-admin.js youremail@example.com");
  process.exit(1);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.log(`No user found with email: ${email}`);
  } else {
    console.log(`✅ ${user.email} is now an admin`);
  }

  process.exit();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});