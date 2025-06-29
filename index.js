const setupSwagger = require('./swagger');
const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());

// Crear tarea
/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Tareas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *     responses:
 *       201:
 *         description: Tarea creada
 */

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
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Obtener todas las tareas
 *     tags: [Tareas]
 *     responses:
 *       200:
 *         description: Lista de tareas
 */
app.get('/tasks', (req, res) => {
  const tasks = db.prepare(`SELECT * FROM tasks`).all();
  res.json(tasks);
});

// Obtener tarea por ID
/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Obtener una tarea por ID
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *       404:
 *         description: Tarea no encontrada
 */
app.get('/tasks/:id', (req, res) => {
  const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(task);
});

// Actualizar tarea
/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Actualizar una tarea existente
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *       404:
 *         description: Tarea no encontrada
 */
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
/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Eliminar una tarea
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Eliminada correctamente
 *       404:
 *         description: Tarea no encontrada
 */

app.delete('/tasks/:id', (req, res) => {
  const result = db.prepare(`DELETE FROM tasks WHERE id = ?`).run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.status(204).send();
});

setupSwagger(app);
// Inicializar base de datos
app.listen(3000, () => {
  console.log('API conectada a SQLite en http://localhost:3000');
});
