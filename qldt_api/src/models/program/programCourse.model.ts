import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class ProgramCourseModel extends Model {
  declare id: string;
  declare programId: string;
  declare courseId: string;
  declare knowledgeBlock: string;
  declare semesterNo: number;
  declare isRequired: boolean;
}

ProgramCourseModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    programId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    knowledgeBlock: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    semesterNo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: "program_courses",
    indexes: [{ unique: true, fields: ["program_id", "course_id"] }]
  }
);
