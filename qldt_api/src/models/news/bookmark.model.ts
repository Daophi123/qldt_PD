import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class BookMarkModel extends Model {
  declare id: string;
  declare newsId: string;
  declare userId: string;
}

BookMarkModel.init(
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
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "bookmarks"
  }
)