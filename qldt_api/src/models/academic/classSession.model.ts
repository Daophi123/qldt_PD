import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class ClassSessionModel extends Model {
  declare id: string;
  declare classSectionId: string;
  declare dayOfWeek: number;
  declare startPeriod: number;
  declare endPeriod: number;
  declare room: string;
}

ClassSessionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    classSectionId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 2, max: 8 }
    },
    startPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    endPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    room: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "class_sessions"
  }
)
