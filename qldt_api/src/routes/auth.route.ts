import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { changePasswordSchema, loginSchema } from "../validations/auth.validation";

const router = Router();

router.post("/seed", AuthController.seedData);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.getMe);
router.put("/password", authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;