import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { ProgramController } from "../controllers/program.controller";

const router = Router();

router.use(authenticate);

router.get("/my", ProgramController.getMyProgram);
router.post("/seed", authorize("admin"), ProgramController.seedData);

export default router;
