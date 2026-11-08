import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { getClassScheduleSchema } from "../validations/schedule.validation";
import { ScheduleController } from "../controllers/schedule.controller";

const router = Router();

router.use(authenticate);

router.get("/class", validate(getClassScheduleSchema), ScheduleController.getClassSchedule);

export default router;