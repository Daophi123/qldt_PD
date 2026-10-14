import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class RefreshTokenModel extends Model {
  declare id: string;
  declare userId: string;
  declare tokenHash: string;
  declare expiresAt: Date;
}

RefreshTokenModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "refresh_tokens"
  }
)