import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { GradeController } from "../controllers/grade.controller";

const router = Router();

router.use(authenticate);

router.get("/my", GradeController.getMyGrades);
router.post("/seed", authorize("admin"), GradeController.seedData);

export default router;
