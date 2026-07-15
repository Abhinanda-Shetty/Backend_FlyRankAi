const express = require("express");
const app = express();

app.use(express.json());

// Stage 1: root and health endpoints
app.get("/", (req, res) => {
  res
    .status(200)
    .send({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", (req, res) => {
  res.status(200).send({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
