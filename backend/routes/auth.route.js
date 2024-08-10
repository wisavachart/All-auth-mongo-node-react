import express from "express";
import {
  checkAuth,
  forgotpassWord,
  login,
  logout,
  resetPassword,
  signup,
  verifyEmail,
} from "../controller/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();
router.get("/check-auth", verifyToken, checkAuth);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-pass", forgotpassWord);
router.post("/reset-pass/:token", resetPassword);

export default router;
