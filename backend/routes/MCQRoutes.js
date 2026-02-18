import { Router } from "express";
import { generateMCQs } from "../controllers/GenerateMCQControllers/GenerateMCQController.js";
const router = Router();

router.post("/", generateMCQs);

export default router;
