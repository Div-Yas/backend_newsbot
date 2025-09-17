import express from "express";
import { ingestArticles } from "../controllers/newsController.js";

const router = express.Router();

router.post("/ingest", ingestArticles);

export default router;
