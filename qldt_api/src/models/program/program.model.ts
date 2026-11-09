import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class ProgramModel extends Model {
  declare id: string;
  declare code: string;
  declare name: string;
  declare majorName: string;
  declare cohort: string;
}

ProgramModel.init(
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
      type: DataTypes.STRING,
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
    tableName: "programs",
    indexes: [{ unique: true, fields: ["major_name", "cohort"] }]
  }
);
