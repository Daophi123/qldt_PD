import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

// Mỗi dòng: một tài khoản đã xem một bản tin. Dùng để mỗi tài khoản chỉ được tính 1 lượt xem.
export class NewsViewModel extends Model {
  declare id: string;
  declare newsId: string;
  declare userId: string;
}

NewsViewModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    newsId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "news_views",
    // Chặn ở tầng database: cùng một tài khoản không thể có 2 dòng cho cùng một bản tin,
    // kể cả khi 2 request xem tin đến cùng lúc.
    indexes: [{ unique: true, fields: ["news_id", "user_id"] }]
  }
);
