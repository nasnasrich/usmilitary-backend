import user from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";
// REGISTER USER

export const createUser = async (req, res) => { 
    try {
        // read input from request body
        const { firstName, lastName , email, phoneNumber, password} = req.body;
        // check if email exists
        const exist = await user.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // HASH PASSWORD
        const salt =await bcrypt.genSalt(10)
        const hashPassword =await bcrypt.hash(password,salt)
        // create new user
        const users = await user.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password:hashPassword,
        });
       return res.status(201).json({
            message: "Registration Successful",
            users,
        })
    } catch (error) {
        console.error(error)
         res.status(500).json({ message: " Server Error", error})
    }
}
//    GET ALL USERS
export const getAllUsers = async (req, res) => { 
    try {
        const users = await user.find().select("-password");
       return res.status(200).json({
            message: "Users retrieved successfully",
            users,
        })
    } catch (error) {
        console.error(error)
         res.status(500).json({ message: " Server Error", error})
    }
}

   //LOGIN USER
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await user.findOne({ email });

    if (!users) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, users.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { id: users._id },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: users._id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Get Single User

export const getUserById = async (req, res) => {
    const userId = req.params.id
    try {
       const users = await user.findById(userId).select('-password')
        if (!users) return res.status(404).json({message: "user not found"})
        res.status(200).json(users)

    } catch (error) {
        res.status(500).json({message:error.message})
 }
}

// update user
export const updateUser = async (req, res) => {
    let userId = req.params.id;
    const { firstName, lastName, email, phoneNumber } = req.body
    try {
        let existingUser = await user.findById(userId);
        if (!existingUser) return res.status(404).json({ message: "User not found" })
            // update only updated fields
        existingUser.firstName = firstName || existingUser.firstName;
        existingUser.lastName = lastName || existingUser.lastName;
        existingUser.email = email || existingUser.email;
        existingUser.phoneNumber = phoneNumber || existingUser.phoneNumber;
        await existingUser.save();
        res.status(200).json({ message: "User updated successfully", user: existingUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteUser = async (req, res) => {
    const userId = req.params.id
    try {
       const existingUser = await user.findById(userId)
        if (!existingUser) return res.status(404).json({message: "user not found"})
            await existingUser.deleteOne()
        res.status(200).json({message: "User deleted successfully"})
}    catch (error) {
        res.status(500).json({message:error.message})
 }}   


// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email was provided
    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address",
      });
    }

    // Find user
    const existingUser = await user.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({
        message: "No account found with this email address",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing it in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 15 minutes
    existingUser.resetPasswordToken = hashedToken;
    existingUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await existingUser.save();

    // Create reset link
    const resetUrl = `https://troopportal.com/reset-password/${resetToken}`;

    // Create email transporter
     const resend = new Resend(process.env.RESEND_API_KEY);
     
    const { data, error } = await resend.emails.send({
    from: "U.S. Military Leave Department <onboarding@resend.dev>",
    to: [existingUser.email],
    subject: "Password Reset Request",
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>

        <p>Hello ${existingUser.firstName || "there"},</p>

        <p>
            We received a request to reset your password.
        </p>

        <p>
            Click the button below to create a new password:
        </p>

        <a
            href="${resetUrl}"
            style="
            display:inline-block;
            padding:12px 20px;
            background:#c0392b;
            color:white;
            text-decoration:none;
            border-radius:5px;
            "
        >
            Reset Password
        </a>

        <p style="margin-top:20px;">
            This link will expire in 15 minutes.
        </p>

        <p>
            If you did not request a password reset, you can safely ignore
            this email.
        </p>

        <p>
            U.S. Military Leave Department
        </p>
        </div>
    `,
    });

    if (error) {
    console.error("Resend error:", error);

    return res.status(500).json({
        message: "Unable to send password reset email",
    });
    }

        // Email


    // RESET PASSWORD
    export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
        return res.status(400).json({
            message: "Please enter a new password",
        });
        }

        if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters",
        });
        }

        // Hash the token received from the URL
        const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

        // Find user with valid token
        const existingUser = await user.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
        });

        if (!existingUser) {
        return res.status(400).json({
            message: "Password reset link is invalid or has expired",
        });
        }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    existingUser.password = hashedPassword;

    // Remove reset token
    existingUser.resetPasswordToken = undefined;
    existingUser.resetPasswordExpires = undefined;

    await existingUser.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Unable to reset password",
    });
  }
};