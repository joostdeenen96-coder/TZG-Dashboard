import { Router } from "express";
import { getWijNews } from "../services/newsService.js";

export const newsRouter = Router();

newsRouter.get("/", async (_req, res) => {
  res.json(await getWijNews());
});
