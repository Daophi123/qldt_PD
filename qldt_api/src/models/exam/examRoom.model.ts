import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class ExamRoomModel extends Model {
  declare id: string;
  declare examId: string;
  declare studentId: string;
  declare room: string;
  declare seatNumber: string;
}

ExamRoomModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    examId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    room: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    seatNumber: {
      type: DataTypes.STRING(10),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "exam_rooms",
    indexes: [{ unique: true, fields: ["exam_id", "student_id"] }]
  }
);
