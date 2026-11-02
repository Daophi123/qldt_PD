import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export const CLASS_SECTION_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  CANCELLED: "cancelled"
} as const;

export type ClassSectionStatus = typeof CLASS_SECTION_STATUS[keyof typeof CLASS_SECTION_STATUS];

export class ClassSectionModel extends Model {
  declare id: string;
  declare code: string;
  declare courseId: string;
  declare semesterId: string;
  declare lecturerName: string;
  declare capacity: number;
  declare status: ClassSectionStatus;
}

ClassSectionModel.init(
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
    courseId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    semesterId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    lecturerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: CLASS_SECTION_STATUS.OPEN
    }
  },
  {
    sequelize,
    tableName: "class_sections"
  }
)
