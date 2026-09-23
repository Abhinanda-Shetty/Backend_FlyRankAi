require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const taskRouter = require("./routers/tasksRouter");
const authRouter = require("./routers/authRouter");
const db = require("./database");
const supabase = require("./supabase.config");
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cookieParser());
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
// Stage 3: create with validation
// Stage 4: full CRUD
app.use("/tasks", taskRouter);

// Stage 1: Signup, Login, Logout Routes
app.use("/auth", authRouter);

//Stage 2: public and protected gates
app.get("/public/info", (req, res) => {
  res.status(200).json({ message: "Welcome stranger! This info is public." });
});
app.get("/protected/profile", async (req, res) => {
  const authHeader = req.headers.authorization; // Bearer <token>
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  // Stage 3: profile route token verification
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  const { id, email, created_at } = data.user;
  res.status(200).json({ id, email, created_at });
});

// Stage 5: Swagger UI
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");
// Serve Swagger UI at /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3000");
});
