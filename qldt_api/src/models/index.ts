import { AttachmentModel } from "./news/attachment.model";
import { BookMarkModel } from "./news/bookmark.model";
import { CategoryModel } from "./news/category.model";
import { CommentModel } from "./news/comment.model";
import { DepartmentModel } from "./news/department.model";
import { NewsModel } from "./news/news.model";
import { NewsViewModel } from "./news/newsView.model";
import { UserModel } from "./user/user.model";
import { RefreshTokenModel } from "./user/refreshToken.model";
import { StudentModel } from "./academic/student.model";
import { SemesterModel } from "./academic/semester.model";
import { CourseModel } from "./academic/course.model";
import { CoursePrerequisiteModel } from "./academic/coursePrerequisite.model";
import { ClassSectionModel } from "./academic/classSection.model";
import { ClassSessionModel } from "./academic/classSession.model";
import { EnrollmentModel } from "./academic/enrollment.model";

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
NewsModel.hasMany(NewsViewModel, { foreignKey: "newsId", as: "viewers" });
NewsViewModel.belongsTo(NewsModel, { foreignKey: "newsId" });

UserModel.hasOne(StudentModel, { foreignKey: "userId", as: "student" });
StudentModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });
CourseModel.belongsToMany(CourseModel, { through: CoursePrerequisiteModel, foreignKey: "courseId", otherKey: "prerequisiteCourseId", as: "prerequisites" });
CourseModel.hasMany(ClassSectionModel, { foreignKey: "courseId", as: "classSections" });
ClassSectionModel.belongsTo(CourseModel, { foreignKey: "courseId", as: "course" });
SemesterModel.hasMany(ClassSectionModel, { foreignKey: "semesterId", as: "classSections" });
ClassSectionModel.belongsTo(SemesterModel, { foreignKey: "semesterId", as: "semester" });
ClassSectionModel.hasMany(ClassSessionModel, { foreignKey: "classSectionId", as: "sessions" });
ClassSessionModel.belongsTo(ClassSectionModel, { foreignKey: "classSectionId", as: "classSection" });
ClassSectionModel.hasMany(EnrollmentModel, { foreignKey: "classSectionId", as: "enrollments" });
EnrollmentModel.belongsTo(ClassSectionModel, { foreignKey: "classSectionId", as: "classSection" });
StudentModel.hasMany(EnrollmentModel, { foreignKey: "studentId", as: "enrollments" });
EnrollmentModel.belongsTo(StudentModel, { foreignKey: "studentId", as: "student" });

export {
  DepartmentModel,
  CategoryModel,
  NewsModel,
  AttachmentModel,
  CommentModel,
  BookMarkModel,
  NewsViewModel,
  UserModel,
  RefreshTokenModel,
  StudentModel,
  SemesterModel,
  CourseModel,
  CoursePrerequisiteModel,
  ClassSectionModel,
  ClassSessionModel,
  EnrollmentModel
}