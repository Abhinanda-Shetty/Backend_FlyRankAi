const express = require("express");
const app = express();

// Middleware to parse JSON request bodies
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
  if (tasks.length === 1) {
    return res.status(404).send({ error: "No tasks found" });
  }
  res.status(200).send(tasks.slice(1)); // Exclude the first element which is the schema
});

app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).send({ error: `Task ${taskId} not found` });
  }
  res.status(200).send(task);
});

// Stage 3: create with validation
app.post("/tasks", (req, res) => {
  const { title } = req.body;
  // If no title provided return 400
  if (!title) {
    return res.status(400).send({ error: "Title is required" });
  }
  // Generate a new id for the task next greater than the current max id
  const id =
    tasks.length > 1
      ? Math.max(...tasks.slice(1).map((task) => task.id)) + 1
      : 1;
  const newTask = { id, title, done: false };

  tasks.push(newTask);
  res.status(201).send(newTask);
});

// Stage 4: full CRUD
app.put("/tasks/:id", (req, res) => {
  // Validate task id
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).send({ error: `Task ${taskId} not found` });
  }

  // Validate request body
  const { title, done } = req.body;
  if (title === undefined && done === undefined) {
    return res
      .status(400)
      .send({ error: "At least one of title or done is required" });
  }
  if (title !== undefined) {
    task.title = title;
  }
  if (done !== undefined) {
    task.done = done;
  }
  // Update the task in the tasks array
  tasks[tasks.indexOf(task)] = task;
  res.status(200).send(task);
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  // Get the index of the task to be deleted
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  // If task not found, return 404
  if (taskIndex === -1) {
    return res.status(404).send({ error: `Task ${taskId} not found` });
  }
  // Remove the task from the tasks array
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
