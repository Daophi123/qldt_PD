import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class GradeModel extends Model {
  declare id: string;
  declare enrollmentId: string;
  declare processScore: number;
  declare examScore: number;
}

GradeModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    enrollmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    processScore: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    examScore: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "grades"
  }
);
