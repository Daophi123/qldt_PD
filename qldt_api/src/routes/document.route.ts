import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { getDocumentListSchema } from "../validations/document.validation";
import { DocumentController } from "../controllers/document.controller";

const router = Router();

router.use(authenticate);

router.get("/", validate(getDocumentListSchema), DocumentController.getDocuments);
router.post("/seed", authorize("admin"), DocumentController.seedData);

export default router;