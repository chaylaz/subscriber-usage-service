const express = require("express");

const usageRoutes = require("./routes/usageRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Subscriber Usage Service is running."
  });
});

app.use("/usage", usageRoutes);

app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found."
  });
});

module.exports = app;