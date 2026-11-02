import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export const ENROLLMENT_STATUS = {
  REGISTERED: "registered",
  CANCELLED: "cancelled"
} as const;

export type EnrollmentStatus = typeof ENROLLMENT_STATUS[keyof typeof ENROLLMENT_STATUS];

export class EnrollmentModel extends Model {
  declare id: string;
  declare studentId: string;
  declare classSectionId: string;
  declare status: EnrollmentStatus;
  declare registeredAt: Date;
}

EnrollmentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    classSectionId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ENROLLMENT_STATUS.REGISTERED
    },
    registeredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: "enrollments",
    indexes: [{ unique: true, fields: ["student_id", "class_section_id"] }]
  }
)
