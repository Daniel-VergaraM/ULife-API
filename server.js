const express = require("express");
const Database = require("better-sqlite3");

const db = new Database("database.db");

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    profile_picture TEXT,
    password TEXT
  );
  
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    user_id INTEGER,
    profile_picture TEXT,
    postType TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const app = express();
app.use(express.json());
app.use(require("cors")());
app.use(require("morgan")("dev"));

app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.get("/posts", (_req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM posts");
    const posts = stmt.all();
    res.json(posts);
  } catch (error) {
    res.sendStatus(500).json({ error: "Error al obtener los posts" });
  }
});

app.post("/post", (req, res) => {
  try {
    const { title, content, user_id, profile_picture, postType } = req.body;
    const stmt = db.prepare(
      "INSERT INTO posts (title, content, user_id, profile_picture, postType) VALUES (?, ?, ?, ?, ?)"
    );
    const result = stmt.run(title, content, user_id, profile_picture, postType);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.sendStatus(500).json({ error: "Error al crear un post" });
  }
});

app.get("/user/:id", (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const user = stmt.get(id);
    res.json(user);
  } catch (error) {
    res.sendStatus(500).json({ error: "Error al obtener el usuario" });
  }
});

app.post("/user", (req, res) => {
  try {
    const { name, email, profile_picture, password } = req.body;
    const stmt = db.prepare(
      "INSERT INTO users (name, email, profile_picture, password) VALUES (?, ?, ?, ?)"
    );
    const result = stmt.run(name, email, profile_picture, password);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.sendStatus(500).json({ error: "Error al crear un usuario" });
  }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})
