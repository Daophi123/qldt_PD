import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class CourseModel extends Model {
  declare id: string;
  declare code: string;
  declare name: string;
  declare credits: number;
}

CourseModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "courses"
  }
)
