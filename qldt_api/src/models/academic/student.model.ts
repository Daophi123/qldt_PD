import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class StudentModel extends Model {
  declare id: string;
  declare userId: string;
  declare studentCode: string;
  declare className: string;
  declare majorName: string;
  declare cohort: string;
}

StudentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    studentCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    className: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    majorName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cohort: {
      type: DataTypes.STRING(10),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "students"
  }
)