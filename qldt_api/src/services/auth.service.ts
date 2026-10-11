import { environment } from "../config/environment";
import { UserModel } from "../models/user/user.model";
import jwt, { SignOptions } from "jsonwebtoken"
import { ApiError } from "../utils/apiError";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";

export class AuthService {
  private static signToken(user: UserModel) {
    return jwt.sign({ sub: user.id, role: user.role }, environment.JWT_SECRET as string, {
      expiresIn: environment.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    });
  }

  public static verifyToken(token: string): string {
    try {
      const payload = jwt.verify(token, environment.JWT_SECRET as string);;
      if(typeof payload === "string" || !payload.sub) {
        throw new Error("Token thiếu thông tin người dùng");
      }
      return payload.sub;
    } catch {
      throw new ApiError("401", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
    }
  }

  public static async login(username: string, password: string) {
    const user = await UserModel.findOne({
      where: { [Op.or]: [{ username }, { email: username }] }
    });
    const isMatch = user !== null && (await bcrypt.compare(password, user.passwordHash));
    if(!user || !isMatch) {
      throw new ApiError("401", "Tài khoản hoặc mật khẩu không đúng");
    }
    if(!user.isActive) {
      throw new ApiError("403", "Tài khoản đã bị khóa");
    }
    return { ...user.toJSON(), token: this.signToken(user) };
  }

  public static async changePassword(user: UserModel, oldPassword: string, newPassword: string) {
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if(!isMatch) {
      throw new ApiError("400", "Mật khẩu cũ không đúng");
    }
    await user.update({ passwordHash: await bcrypt.hash(newPassword, 11) });
  }

  public static async seedInitialData() {
    if(environment.NODE_ENV !== "development") {
      throw new ApiError("403", "Chỉ được khởi tạo tài khoản mẫu ở môi trường development");
    }

    const userCount = await UserModel.count();
    if(userCount === 0) {
      await UserModel.create({
        username: "admin",
        fullName: "Quản trị viên",
        role: "admin",
        passwordHash: await bcrypt.hash("Admin@123", 10),
      });
      await UserModel.create({
        username: "24100001",
        fullName: "Sinh viên mẫu",
        role: "student",
        passwordHash: await bcrypt.hash("Student@123", 10),
      });

      return { seeded: true, message: "Khởi tạo tài khoản mẫu thành công" };
    }
    return { seeded: false, message: "Dữ liệu tài khoản đã tồn tại từ trước" };
  }
}