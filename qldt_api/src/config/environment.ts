import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "NODE_ENV",
  "BASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "ENCRYPTION_SECRET_KEY",
  "CORS_ORIGIN"
]

const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if(missingEnvVars.length > 0) {
  console.error(`Bạn đang thiếu ${missingEnvVars.length} biến mỗi trường bắt buộc sau:`);
  missingEnvVars.forEach(key => console.error(`[${key}]`));
  console.error("Vui lòng bổ sung vào file .env rồi khởi động lại");
  try {
    process.kill(process.ppid);
  } catch {
    
  }
  process.exit(1);
}

export const environment = {
  PORT: Number(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV,
  BASE_URL: process.env.BASE_URL,
  DB_STORAGE: process.env.DB_STORAGE || "./data/dbqldt-example.sqlite",
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY,
  CORS_ORIGIN: process.env.CORS_ORIGIN
}