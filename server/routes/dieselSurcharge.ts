import { Router } from "express";
import { getDieselSurcharge } from "../services/dieselSurchargeService.js";

export const dieselSurchargeRouter = Router();

dieselSurchargeRouter.get("/", (_req, res) => {
  try {
    res.json(getDieselSurcharge());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dieseltoeslag niet beschikbaar.";
    res.status(502).json({ error: message });
  }
});
