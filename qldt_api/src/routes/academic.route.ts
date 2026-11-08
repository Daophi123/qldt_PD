import { Router } from "express";
import { AcademicController } from "../controllers/academic.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/semesters", AcademicController.getSemesters);
router.post("/seed", authorize("admin"), AcademicController.seedData);

export default router;
