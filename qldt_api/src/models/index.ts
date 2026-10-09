import { AttachmentModel } from "./news/attachment.model";
import { BookMarkModel } from "./news/bookmark.model";
import { CategoryModel } from "./news/category.model";
import { CommentModel } from "./news/comment.model";
import { DepartmentModel } from "./news/department.model";
import { NewsModel } from "./news/news.model";

NewsModel.belongsTo(DepartmentModel, { foreignKey: "departmentId", as: "department" });
DepartmentModel.hasMany(NewsModel, { foreignKey: "departmentId", as: "news" });
NewsModel.belongsTo(CategoryModel, { foreignKey: "categoryId", as: "category" });
CategoryModel.hasMany(NewsModel, { foreignKey: "categoryId", as: "news" });
NewsModel.hasMany(AttachmentModel, { foreignKey: "newsId", as: "attachments" });
AttachmentModel.belongsTo(NewsModel, { foreignKey: "newsId" });
NewsModel.hasMany(CommentModel, { foreignKey: "newsId", as: "comments" });
CommentModel.belongsTo(NewsModel, { foreignKey: "newsId" });
NewsModel.hasMany(BookMarkModel, { foreignKey: "newsId", as: "bookmarks" });
BookMarkModel.belongsTo(NewsModel, { foreignKey: "newsId", as: "news" });

export {
  DepartmentModel,
  CategoryModel,
  NewsModel,
  AttachmentModel,
  CommentModel,
  BookMarkModel
}