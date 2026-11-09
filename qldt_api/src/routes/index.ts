import { Router } from "express";
import newsRoutes from "./news.route";
import authRoutes from "./auth.route"
import academicRoutes from "./academic.route";
import scheduleRoutes from "./schedule.route";
import documentRoutes from "./document.route";
import examRoutes from "./exam.route";
import programRoutes from "./program.route";
import gradeRoutes from "./grade.route";
import registrationRoutes from "./registration.route";

const routes = Router();

routes.use("/news", newsRoutes);
routes.use("/auth", authRoutes)
routes.use("/academic", academicRoutes);
routes.use("/schedules", scheduleRoutes)
routes.use("/documents", documentRoutes);
routes.use("/exams", examRoutes);
routes.use("/programs", programRoutes);
routes.use("/grades", gradeRoutes);
routes.use("/registrations", registrationRoutes);

export default routes;
