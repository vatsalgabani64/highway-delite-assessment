import { generateOtp, sendOtpEmail } from "../utils/otpService";
import { Request, Response, RequestHandler } from "express"; // Added RequestHandler
import User from "../models/User"; // Assuming User is a Mongoose model
import jwt  from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';


export const signup: RequestHandler = async (req, res) => { // Explicitly typed as RequestHandler
    const { name, dob, email } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: "User already exists" }); // Removed 'return'
            return; // Explicitly return to end function execution
        }
        // Generate OTP
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

        // Create new user
        const newUser = new User({
            name,
            dob,
            email,
            otp,
            otpExpires
        });
        user = await newUser.save();

        // Send OTP email
        await sendOtpEmail(email, otp);
        res.status(201).json({ message: "User created successfully. OTP sent to email." });
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const verifyOtp: RequestHandler = async (req, res) => { // Explicitly typed as RequestHandler
    const { email, otp } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" }); // Removed 'return'
            return; // Explicitly return to end function execution
        }
        console.log(otp,user.otp);
        // Check if OTP is valid and not expired
        // Ensure user.otp and user.otpExpires exist before comparison
        if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < new Date()) {
            res.status(400).json({ message: "Invalid or expired OTP" }); // Removed 'return'
            return; // Explicitly return to end function execution
        }

        // Mark user as verified
        user.isVerified = true;
        user.otp = null; // Clear OTP after verification
        user.otpExpires = null; // Clear OTP expiration
        await user.save();

        const token = jwt.sign(
        { _id: user._id },                     // payload
        process.env.JWT_SECRET!,              // secret
        { expiresIn: '1h' }                    // options
        );

        res.status(200).json({
        message: "OTP verified successfully",
        token   // ✅ Send token to client
        });
        return;
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const login: RequestHandler = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      res.status(404).json({ message: "User not found or not verified" });
      return;
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "OTP sent to email" });
    return;
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyLoginOtp: RequestHandler = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      res.status(404).json({ message: "User not found or not verified" });
      return;
    }

    if (!user.otpExpires || user.otp !== otp || user.otpExpires < new Date()) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
    return;
  } catch (error) {
    console.error("Verify login OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select('name email');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ name: user.name, email: user.email });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin: RequestHandler = async (req, res) => {
  try{
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;

    let user = await User.findOne({ email });
    if (!user) user = await User.create({ email, name: payload?.name });

    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!);
    res.json({ token: jwtToken, user });
  } catch (error) {
    console.error('Error Logging In by google', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
