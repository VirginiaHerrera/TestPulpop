# 📝 API de Gestión de Tareas

Una pequeña API REST para crear, consultar, actualizar y eliminar tareas. Desarrollada con Node.js, Express y SQLite.

## 🚀 Cómo ejecutar el proyecto

1. Clona este repositorio
2. Instala las dependencias:

/*
```bash
*/
git clone https://github.com/VirginiaHerrera/TestPulpop.git
cd TestPulpop
npm install
node index.js


##🛠️ Tecnologías usadas
Node.js
Express
SQLite (better-sqlite3)
Swagger (swagger-jsdoc + swagger-ui-express)


##📁 Estructura del proyecto
TestPulpop/
├── db.js             # Configura la base de datos SQLite
├── index.js          # Define los endpoints y levanta el servidor
├── swagger.js        # Configuración de Swagger
├── tareas.db         # Archivo de base de datos SQLite
├── package.json      # Dependencias y scripts
├── .gitignore        # Archivos ignorados por Git
└── README.md         # Documentación

##🔌 Endpoints disponibles
Método	Ruta	Descripción
POST	/tasks	Crear una nueva tarea
GET	/tasks	Listar todas las tareas
GET	/tasks/:id	Obtener una tarea por su ID
PUT	/tasks/:id	Actualizar una tarea existente
DELETE	/tasks/:id	Eliminar una tarea

## 📚 Documentación Swagger
Accede a la documentación interactiva en:

http://localhost:3000/api-docs
