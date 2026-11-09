import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { cancelRegistrationSchema, getRegistrationSchema, registerSchema } from "../validations/registration.validation";
import { RegistrationController } from "../controllers/registration.controller";

const router = Router();

router.use(authenticate);

router.get("/", validate(getRegistrationSchema), RegistrationController.getOverview);
router.get("/history", validate(getRegistrationSchema), RegistrationController.getHistory);
router.post("/", validate(registerSchema), RegistrationController.register);
router.delete("/:enrollmentId", validate(cancelRegistrationSchema), RegistrationController.cancel);

export default router;
