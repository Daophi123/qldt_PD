import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class SemesterModel extends Model {
  declare id: string;
  declare code: string;
  declare name: string;
  declare academicYear: string;
  declare startDate: string;
  declare endDate: string;
  declare registrationStart?: string;
  declare registrationEnd?: string;
}

SemesterModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    startDate: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    endDate: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    registrationStart: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    registrationEnd: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "semesters"
  }
)