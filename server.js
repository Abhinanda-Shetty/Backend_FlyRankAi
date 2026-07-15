const express = require("express");
const app = express();

app.use(express.json());

// Define the tasks object with the specified properties
const tasks = [
  {
    id: Number,
    title: String,
    done: Boolean,
  },
];
tasks.push({ id: 1, title: "Meeting", done: false });
tasks.push({ id: 2, title: "Assignment", done: true });
tasks.push({ id: 3, title: "Event", done: false });

// Stage 1: root and health endpoints
app.get("/", (req, res) => {
  res
    .status(200)
    .send({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", (req, res) => {
  res.status(200).send({ status: "ok" });
});

// Stage 2: read endpoints with 404
app.get("/tasks", (req, res) => {
  res.status(200).send(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    res.status(404).send({ error: `Task ${taskId} not found` });
  }
  res.status(200).send(task);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
