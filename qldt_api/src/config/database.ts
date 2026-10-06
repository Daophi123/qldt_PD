import path from "path";
import { Sequelize } from "sequelize";
import { environment } from "./environment";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage:  path.resolve(process.cwd(), environment.DB_STORAGE),
  logging: environment.NODE_ENV === "development" ? console.log : false,
  define: {
    timestamps: true,
    underscored: true
  }
});

export const connectDB = async() => {
  try {
    await sequelize.authenticate();
    console.log("Đã kết nối tới cơ sở dữ liệu thành công!");
    await sequelize.sync();
    console.log("Đã đồng bộ cấu trúc bảng Database!");
  } catch(e) {
    console.error("Kết nối cơ sở dữ liệu thất bại: ", e);
    process.exit(1);
  }
}