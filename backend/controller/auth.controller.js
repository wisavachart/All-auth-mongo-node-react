import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateVarificationCode } from "../utils/generateVarificationCode.js";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
import {
  sendPassResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/email.js";

// SIGN UP //
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All fail");
    }
    const userAlreadyExits = await User.findOne({ email });
    if (userAlreadyExits) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashPassWord = await bcryptjs.hash(password, 10);
    const verificationToken = generateVarificationCode(); /// สร้างเอง
    const user = new User({
      email,
      password: hashPassWord,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 ชม.
    });
    await user.save();

    //jwt
    generateTokenAndSetCookies(res, user._id);
    await sendVerificationEmail(user.email, verificationToken);
    res.status(201).json({
      sucess: true,
      message: "Sign up sucess",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ sucess: false, message: "Error signup fail" });
  }
};

//VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  // - - - - - -
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    await sendWelcomeEmail(user.email, user.name);
    res.status(201).json({
      sucess: true,
      message: "Verify success",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ sucess: false, message: "verify fail" });
  }
};

// LOG IN //
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid credentials" });
    }
    const isPassWordValid = await bcryptjs.compare(password, user.password);
    if (!isPassWordValid) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid passWord" });
    }
    generateTokenAndSetCookies(res, user._id);
    user.lastLogin = new Date();
    await user.save();
    res.status(200).json({
      sucess: true,
      message: "Login success",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ sucess: false, message: "login fail" });
  }
};

// LOG OUT //
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// FORGOT PASSWORD //
export const forgotpassWord = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ sucess: false, message: "not found" });
    }

    //Generate reset Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 ชม.
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    //Send Email
    await sendPassResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res
      .status(200)
      .json({ sucess: true, message: "Success Too send request reset pass" });
  } catch (error) {
    res.status(400).json({ sucess: false, message: "fail" });
  }
};
// RESET //
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: {
        $gt: Date.now(), // Greater thand date now
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid or expire reset Token" });
    }
    // update pass
    const hashPassWord = await bcryptjs.hash(password, 10);
    user.password = hashPassWord;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);
    res.status(200).json({ success: true, message: "reset complete" });
  } catch (error) {
    console.log(error);
  }
};

//CHECK AUTH //
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // unselect
    if (!user) {
      res.status(400).json({ sucess: false, message: "USER NOT FOUND" });
    }

    res.status(200).json({ sucess: true, user });
  } catch (e) {
    res.status(400).json({ sucess: false, message: e.message });
  }
};
