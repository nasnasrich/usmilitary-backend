import user from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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