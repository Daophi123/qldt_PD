import { Router } from "express";
import { NewsController } from "../controllers/news.controller";
import { validate } from "../middlewares/validation.middleware";
import { getNewsListSchema, idParamSchema, createNewsSchema, updateNewsSchema, createCommentSchema } from "../validations/news.validation";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/seed", authorize("admin"), NewsController.seedData);
router.get("/departments", NewsController.getDepartments);
router.get("/categories", NewsController.getCategories);
router.get("/grouped", NewsController.getGroupedNews);
router.get("/bookmarks", NewsController.getBookmarks);
router.get("/", validate(getNewsListSchema), NewsController.getNewsList);
router.post("/", authorize("admin"), validate(createNewsSchema), NewsController.createNews);
router.get("/:id", validate(idParamSchema), NewsController.getNewsDetail);
router.put("/:id", authorize("admin"), validate(updateNewsSchema), NewsController.updateNews);
router.delete("/:id", authorize("admin"), validate(idParamSchema), NewsController.deleteNews);
router.get("/:id/comments", validate(idParamSchema), NewsController.getComments);
router.post("/:id/comments", validate(createCommentSchema), NewsController.createComment);
router.get("/:id/bookmarks/check", validate(idParamSchema), NewsController.checkBookmark);
router.post("/:id/bookmarks", validate(idParamSchema), NewsController.addBookmark);
router.delete("/:id/bookmarks", validate(idParamSchema), NewsController.removeBookmark);

export default router;
