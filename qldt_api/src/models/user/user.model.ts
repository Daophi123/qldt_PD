import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export type UserRole = "student" | "admin";

export class UserModel extends Model {
  declare id: string;
  declare username: string;
  declare email?: string;
  declare passwordHash: string;
  declare fullName: string;
  declare role: UserRole;
  declare isActive: boolean;

  toJSON() {
    const { passwordHash, ...rest } = this.get();
    return rest;
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "student"
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: "users"
  }
)