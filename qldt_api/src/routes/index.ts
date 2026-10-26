import { Router } from "express";
import newsRoutes from "./news.route";
import authRoutes from "./auth.route"

const routes = Router();

routes.use("/news", newsRoutes);
routes.use("/auth", authRoutes)

export default routes;
