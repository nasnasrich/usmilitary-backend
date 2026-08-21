// userRoute.js
import express from "express";
import { createUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser, forgotPassword, resetPassword} from "../controllers/userController.js";

const router = express.Router();

router.post('/register', createUser)
router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post("/reset-password/:token", resetPassword);
router.put('/update/:id', updateUser)
router.delete('/delete/:id', deleteUser)
router.get('/', getAllUsers)
router.get('/:id', getUserById)
export default router


