import { Router } from "express";
import newsRoutes from "./news.route";
import authRoutes from "./auth.route"
import academicRoutes from "./academic.route";
import scheduleRoutes from "./schedule.route";

const routes = Router();

routes.use("/news", newsRoutes);
routes.use("/auth", authRoutes)
routes.use("/academic", academicRoutes);
routes.use("/schedules", scheduleRoutes)

export default routes;
