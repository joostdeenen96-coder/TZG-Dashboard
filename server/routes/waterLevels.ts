import { Router } from "express";
import { getWaterLevels } from "../services/waterLevelService.js";

export const waterLevelsRouter = Router();

waterLevelsRouter.get("/", (_req, res) => {
  res.json(getWaterLevels());
});
