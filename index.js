const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());

// Crear tarea
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

// Obtener todas las tareas
app.get('/tasks', (req, res) => {
  const tasks = db.prepare(`SELECT * FROM tasks`).all();
  res.json(tasks);
});

// Obtener tarea por ID
app.get('/tasks/:id', (req, res) => {
  const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(task);
});

// Actualizar tarea
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

// Eliminar tarea
app.delete('/tasks/:id', (req, res) => {
  const result = db.prepare(`DELETE FROM tasks WHERE id = ?`).run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.status(204).send();
});

app.listen(3000, () => {
  console.log('API conectada a SQLite en http://localhost:3000');
});
