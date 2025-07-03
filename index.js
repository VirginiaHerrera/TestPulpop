//setupSwagger: importa la función que configura Swagger para documentación.
const setupSwagger = require('./swagger');
//express: framework para construir APIs en Node.js.
const express = require('express');
//db: conexión a SQLite creada en db.js.
const db = require('./db');
//app: instancia de la app Express.
const app = express();
//app.use(express.json()): permite recibir datos JSON en las peticiones (como POST, PUT).
app.use(express.json());
module.exports = app; // Exporta la app para usarla en tests y otros archivos.


//const app = require('./app');


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

//Extrae los datos enviados por el cliente.
app.post('/tasks', (req, res) => {
  const { title, description, status } = req.body;  
  //Valida que el título exista y que el estado sea uno permitido. El include revisa si el estado está en la lista de estados válidos.
  //Si no es válido, devuelve un error 400 (Bad Request).
  if (!title || !['pending', 'in_progress', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
//Inserta la nueva tarea en la base de datos con fecha actual.
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, status, created_at)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(title, description || '', status, new Date().toISOString());
//Obtiene y devuelve la tarea recién creada.
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
//Consulta todas las tareas y las devuelve en JSON.
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
//Recibe datos nuevos.
app.put('/tasks/:id', (req, res) => {
  const { title, description, status } = req.body;
  //Verifica si la tarea existe.
  const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  //Usa el valor nuevo si existe, o conserva el anterior.
  const updatedTask = {
    title: title ?? task.title,
    description: description ?? task.description,
    status: status ?? task.status,
  };
  //Usa un nuevo valor o conserva el anterior.
  if (!['pending', 'in_progress', 'done'].includes(updatedTask.status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  //Actualiza la tarea en la base de datos y la devuelve modificada.
  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, status = ?
    WHERE id = ?
  `).run(updatedTask.title, updatedTask.description, updatedTask.status, req.params.id);
//updatedTask. forma moderno de js para crear un objeto con las propiedades actualizadas. Permite conservar los valores anteriores si no se envían nuevos.
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
//Elimina la tarea por ID.
app.delete('/tasks/:id', (req, res) => {
  const result = db.prepare(`DELETE FROM tasks WHERE id = ?`).run(req.params.id);
  //Si no hay cambios (nada se borró), responde con 404. Si se eliminó, devuelve 204 (sin contenido).
  if (result.changes === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.status(204).send();
});

setupSwagger(app);
// Inicializar base de datos
/*
app.listen(3000, () => {
  console.log('API conectada a SQLite en http://localhost:3000');
});
*/
const PORT = 3000;
if(require.main === module){
  app.listen(PORT, () => {
    console.log(`API conectada a SQLite en http://localhost:${PORT}`);
  });
}
