import express from "express";
import { waterLevelsRouter } from "./routes/waterLevels.js";

const port = 43124;
const app = express();

app.use("/api/waterlevels", waterLevelsRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`Waterstanden-API op http://127.0.0.1:${port}`);
});
