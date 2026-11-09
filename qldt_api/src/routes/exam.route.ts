import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { getExamScheduleSchema } from "../validations/exam.validation";
import { ExamController } from "../controllers/exam.controller";

const router = Router();

router.use(authenticate);

router.get("/", validate(getExamScheduleSchema), ExamController.getExamSchedule);
router.post("/seed", authorize("admin"), ExamController.seedData);

export default router;
