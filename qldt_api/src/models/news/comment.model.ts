import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class CommentModel extends Model {
  declare id: string;
  declare newsId: string;
  declare userId?: string;
  declare authorName: string;
  declare avatar?: string;
  declare content: string;
}

CommentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    newsId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Sinh viên"
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "comments"
  }
)