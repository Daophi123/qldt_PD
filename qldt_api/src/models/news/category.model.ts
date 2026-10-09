import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class CategoryModel extends Model {
  declare id: string;
  declare code: string;
  declare name: string;
  declare order: number;
}

CategoryModel.init(
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
    }
  },
  {
    sequelize,
    tableName: "categories"
  }
)