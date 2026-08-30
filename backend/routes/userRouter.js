import express from "express";

import { login, registerUser, listUsers } from "../controllers/userController.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", login);
userRouter.get("/", authMiddleware,adminOnly, listUsers);

// Verify that the logged-in user is an admin
userRouter.get("/verify-admin", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin verified"
  });
});

export default userRouter;