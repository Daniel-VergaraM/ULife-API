const express = require("express");
const Database = require("better-sqlite3");

const db = new Database("database.db");

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(63),
    email VARCHAR(127),
    profile_picture VARCHAR(511),
    password VARCHAR(63)
  );
  
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    title VARCHAR(127),
    content VARCHAR(511),
    user_id INTEGER,
    profile_picture VARCHAR(511),
    postType VARCHAR(7),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const app = express();
app.use(express.json());
app.use(require("cors")());
app.use(require("morgan")("dev"));

app.get("/", (_req, res, _next) => {
  res.send("Hello World");
});

app.get("/posts", (_req, res, _next) => {
  try {
    const stmt = db.prepare("SELECT * FROM posts");
    const posts = stmt.all();
    res.json(posts);
  } catch (error) {
    res.sendStatus(500).json({ error: "Error al obtener los posts" });
  }
});

app.post("/post", (req, res, _next) => {
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

app.delete("/post/:id", (req, res, _next) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM posts WHERE id = ?");
    stmt.run(id);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500).json({ error: "Error al eliminar el post" });
  }
})

app.get("/user/:id", (req, res, _next) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const user = stmt.get(id);
    res.json(user);
  } catch (error) {
    res.sendStatus(500).json({ error: "Error al obtener el usuario" });
  }
});

app.post("/user", (req, res, _next) => {
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

app.delete("/user/:id", (req, res, _next) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    stmt.run(id);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500).json({ error: "Error al eliminar el usuario" });
  }
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})
