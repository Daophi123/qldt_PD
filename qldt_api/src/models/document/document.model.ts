import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export const DOCUMENT_TYPES = ["regulation", "rule", "guide", "form"] as const;
export type DocumentType = typeof DOCUMENT_TYPES[number];

export class DocumentModel extends Model {
  declare id: string;
  declare code: string;
  declare title: string;
  declare summary?: string;
  declare type: DocumentType;
  declare departmentId: string;
  declare issuedDate: string;
  declare isActive: boolean;
}

DocumentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    summary: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    issuedDate: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: "documents"
  }
);