import { Router } from "express";
import { getWaterLevels } from "../services/waterLevelService.js";

export const waterLevelsRouter = Router();

waterLevelsRouter.get("/", async (_req, res) => {
  try {
    res.json(await getWaterLevels());
  } catch {
    res.status(500).json({ error: "Waterstanden niet beschikbaar." });
  }
});
