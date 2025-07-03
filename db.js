//fs: módulo de Node.js para trabajar con el sistema de archivos.
//better-sqlite3: biblioteca para manejar SQLite de forma rápida y sin promesas.
const fs = require('fs');
const Database = require('better-sqlite3');

//Indica la ruta del archivo de la bbdd, definiendo el nombre del archivo.
const DB_PATH = 'tareas.db';

// Verificar si el archivo existe y es una base de datos válida
let db;
try {
  if (fs.existsSync(DB_PATH)) {
    db = new Database(DB_PATH);
    // Probar si es legible (ejecutamos una consulta mínima)
    db.prepare('PRAGMA schema_version').get();
  } else {
    db = new Database(DB_PATH);
  }
} catch (err) {
  console.warn('⚠️ Archivo tareas.db corrupto. Se regenerará.');
  fs.unlinkSync(DB_PATH); // Eliminar el archivo dañado
  db = new Database(DB_PATH);
}

// Crear tabla si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('pending', 'in_progress', 'done')) NOT NULL,
    created_at TEXT NOT NULL
  )
`).run();

module.exports = db;
