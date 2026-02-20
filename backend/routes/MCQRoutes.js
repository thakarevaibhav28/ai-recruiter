import { Router } from "express";
import { generateMCQs } from "../controllers/GenerateMCQControllers/GenerateMCQController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/:id", generateMCQs);

export default router;
