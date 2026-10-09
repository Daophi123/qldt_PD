import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../../config/database";
import type { CategoryModel } from "./category.model";
import type { DepartmentModel } from "./department.model";
import type { AttachmentModel } from "./attachment.model";
import type { CommentModel } from "./comment.model";

export class NewsModel extends Model {
  declare id: string;
  declare title: string;
  declare summary?: string;
  declare content: string;
  declare categoryId: string;
  declare departmentId: string;
  declare authorId?: string;
  declare authorName?: string;
  declare thumbnailUrl?: string;
  declare startDate: string;
  declare endDate?: string;
  declare isPinned: boolean;
  declare isActive: boolean;
  declare views: number;
  declare category?: CategoryModel;
  declare department?: DepartmentModel;
  declare attachments?: AttachmentModel[];
  declare comments?: CommentModel[];
}

NewsModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    authorId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    thumbnailUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    startDate: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    endDate: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: "news"
  }
)