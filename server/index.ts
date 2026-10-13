import express from "express";
import { adminRouter } from "./routes/admin.js";
import { configRouter } from "./routes/config.js";
import { dieselSurchargeRouter } from "./routes/dieselSurcharge.js";
import { newsRouter } from "./routes/news.js";
import { waterLevelsRouter } from "./routes/waterLevels.js";

const port = 43124;
const app = express();

app.use(express.json({ limit: "32kb" }));
app.use("/api/admin", adminRouter);
app.use("/api/config", configRouter);
app.use("/api/waterlevels", waterLevelsRouter);
app.use("/api/news", newsRouter);
app.use("/api/dieselsurcharge", dieselSurchargeRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`Waterstanden-API op http://127.0.0.1:${port}`);
});
