import express from "express";
import { startSession, sendMessage, getHistory, clearSession } from "../controllers/chatController.js";

const router = express.Router();

router.post("/session", startSession);
router.post("/message", sendMessage);
router.get("/history/:sessionId", getHistory);
router.delete("/session/:sessionId", clearSession);

export default router;
