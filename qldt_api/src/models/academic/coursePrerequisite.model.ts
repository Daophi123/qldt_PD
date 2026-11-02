import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class CoursePrerequisiteModel extends Model {
  declare id: string;
  declare courseId: string;
  declare prerequisiteCourseId: string;
}

CoursePrerequisiteModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    prerequisiteCourseId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "course_prerequisites",
    indexes: [{ unique: true, fields: ["course_id", "prerequisite_course_id"] }]
  }
)
