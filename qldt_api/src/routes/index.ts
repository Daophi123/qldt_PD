import { Router } from "express";
import newsRoutes from "./news.route";
import authRoutes from "./auth.route"
import academicRoutes from "./academic.route";

const routes = Router();

routes.use("/news", newsRoutes);
routes.use("/auth", authRoutes)
routes.use("/academic", academicRoutes);

export default routes;
