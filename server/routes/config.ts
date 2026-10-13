import { Router } from "express";
import { getScreenConfig } from "../services/dashboardConfig.js";

export const configRouter = Router();

configRouter.get("/", (_req, res) => {
  res.json(getScreenConfig());
});
