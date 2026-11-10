const sqlite = require("better-sqlite3");

const db = new sqlite("tasks.db");

module.exports = db;
