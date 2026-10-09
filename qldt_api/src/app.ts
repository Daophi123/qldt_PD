import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "./models";
import routes from "./routes/index";
import { errorHandler } from "./middlewares/error.middleware";
import { ApiError } from "./utils/apiError";

const app: Application = express();

app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

app.use((_req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError("404", "Đường dẫn không tồn tại hoặc đã bị thay đổi"));
});

app.use(errorHandler);

export default app;