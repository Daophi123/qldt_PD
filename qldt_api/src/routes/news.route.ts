import { Router } from "express";
import { NewsController } from "../controllers/news.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  getNewsListSchema,
  idParamSchema,
  createNewsSchema,
  updateNewsSchema,
  createCommentSchema,
  bookmarkBodySchema,
  userIdQuerySchema,
} from "../validations/news.validation";

const router = Router();

router.post("/seed", NewsController.seedData);
router.get("/departments", NewsController.getDepartments);
router.get("/categories", NewsController.getCategories);
router.get("/grouped", NewsController.getGroupedNews);
router.get("/bookmarks", validate(userIdQuerySchema), NewsController.getBookmarks);
router.get("/", validate(getNewsListSchema), NewsController.getNewsList);
router.post("/", validate(createNewsSchema), NewsController.createNews);
router.get("/:id", validate(idParamSchema), NewsController.getNewsDetail);
router.put("/:id", validate(updateNewsSchema), NewsController.updateNews);
router.delete("/:id", validate(idParamSchema), NewsController.deleteNews);
router.get("/:id/comments", validate(idParamSchema), NewsController.getComments);
router.post("/:id/comments", validate(createCommentSchema), NewsController.createComment);
router.get("/:id/bookmarks/check", validate(idParamSchema), NewsController.checkBookmark);
router.post("/:id/bookmarks", validate(bookmarkBodySchema), NewsController.addBookmark);
router.delete("/:id/bookmarks", validate(idParamSchema), NewsController.removeBookmark);

export default router;
