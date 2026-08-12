import express from "express";
import { sendEmergencyLeave } from "../controllers/mailController.js";

const router = express.Router();

router.post("/emergency-leave", sendEmergencyLeave);

export default router;