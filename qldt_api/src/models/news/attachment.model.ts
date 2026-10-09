import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class AttachmentModel extends Model {
  declare id: string;
  declare newsId: string;
  declare fileName: string;
  declare fileUrl: string;
  declare fileSize?: number;
  declare fileType?: string;
}

AttachmentModel.init(
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
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fileType: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "attachments"
  }
)