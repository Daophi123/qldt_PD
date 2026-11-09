import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class ExamModel extends Model {
  declare id: string;
  declare classSectionId: string;
  declare examDate: string;
  declare startTime: string;
  declare durationMinutes: number;
  declare format: string;
}

ExamModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    classSectionId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    examDate: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    startTime: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    format: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "exams"
  }
);
