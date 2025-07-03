const express = require('express');
const db = require('./db');
const setupSwagger = require('./swagger');

const app = express();
app.use(express.json());
setupSwagger(app);

// Rutas
app.post('/tasks', (req, res) => {
  const { title, description, status } = req.body;
  if (!title || !['pending', 'in_progress', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, status, created_at)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(title, description || '', status, new Date().toISOString());
  const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(result.lastInsertRowid);
  res.status(201).json(task);
});

app.get('/tasks', (req, res) => {
  const tasks = db.prepare(`SELECT * FROM tasks`).all();
  res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(task);
});

app.put('/tasks/:id', (req, res) => {
  const { title, description, status } = req.body;
  const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  const updatedTask = {
    title: title ?? task.title,
    description: description ?? task.description,
    status: status ?? task.status,
  };

  if (!['pending', 'in_progress', 'done'].includes(updatedTask.status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, status = ?
    WHERE id = ?
  `).run(updatedTask.title, updatedTask.description, updatedTask.status, req.params.id);

  const refreshed = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(req.params.id);
  res.json(refreshed);
});

app.delete('/tasks/:id', (req, res) => {
  const result = db.prepare(`DELETE FROM tasks WHERE id = ?`).run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.status(204).send();
});

module.exports = app;
