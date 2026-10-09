import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class DepartmentModel extends Model {
  declare id: string;
  declare code: string;
  declare name: string;
  declare order: number;
  declare isActive: boolean;
}

DepartmentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: "departments"
  }
);