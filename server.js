const express = require("express");
const db = require("./database");
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// create a tasks table if it doesn't exist
db.prepare(
  "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT , done BOOLEAN DEFAULT 0)"
).run();

db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run("Meeting", 0);
db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run(
  "Assignment",
  1
);
db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run("Event", 0);

// Stage 1: root and health endpoints
app.get("/", (req, res) => {
  res.status(200).send({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks", "/health", "/tasks/:id", "/docs"],
  });
});

app.get("/health", (req, res) => {
  res.status(200).send({ status: "ok" });
});

// Stage 2: read endpoints with 404
app.get("/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  if (tasks.length === 0) {
    return res.status(404).send({ error: "No tasks found" });
  }
  res.status(200).send(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
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
  const id = db.prepare("SELECT MAX(id) FROM tasks").get()["MAX(id)"] + 1 || 1;
  const newTask = { id, title, done: false };

  db.prepare("INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)").run(
    newTask.id,
    newTask.title,
    newTask.done
  );
  res.status(201).send(newTask);
});

// Stage 4: full CRUD
app.put("/tasks/:id", (req, res) => {
  // Validate task id
  const taskId = parseInt(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
  console.log(task);
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
  // Update the task in the database
  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(
    task.title,
    task.done,
    taskId
  );
  res.status(200).send(task);
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  // Get the task to be deleted
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
  // If task not found, return 404
  if (!task) {
    return res.status(404).send({ error: `Task ${taskId} not found` });
  }
  // Remove the task from the tasks array
  db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
  res.status(204).send(); // Return 204 No Content
});

// Stage 5: Swagger UI
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");
// Serve Swagger UI at /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
