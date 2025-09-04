import express from "express";
import { ENV } from "./config/env.js";
import { ConnectDB } from "./config/db.js";
const app = express();

ConnectDB();

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
