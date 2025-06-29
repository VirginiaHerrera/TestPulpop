📝 API REST de Gestión de Tareas
Una pequeña API REST creada con Node.js, Express y SQLite para gestionar tareas. Incluye documentación automática con Swagger.

🚀 Cómo ejecutar el proyecto
bash
Copy
Edit
git clone https://github.com/VirginiaHerrera/TestPulpop.git
cd TestPulpop
npm install
node index.js
Luego abre tu navegador en:

bash
Copy
Edit
http://localhost:3000/api-docs
🛠️ Tecnologías usadas
Node.js

Express

SQLite (better-sqlite3)

Swagger (swagger-jsdoc + swagger-ui-express)

📁 Estructura del proyecto
bash
Copy
Edit
TestPulpop/
├── db.js             # Configura la base de datos SQLite
├── index.js          # Define los endpoints y levanta el servidor
├── swagger.js        # Configuración de Swagger
├── tareas.db         # Archivo de base de datos SQLite
├── package.json      # Dependencias y scripts
├── .gitignore        # Archivos ignorados por Git
└── README.md         # Este archivo :)
🔌 Endpoints disponibles
Método	Ruta	Descripción
POST	/tasks	Crear una nueva tarea
GET	/tasks	Listar todas las tareas
GET	/tasks/:id	Obtener una tarea por su ID
PUT	/tasks/:id	Actualizar una tarea existente
DELETE	/tasks/:id	Eliminar una tarea

📚 Documentación Swagger
Accede a la documentación interactiva en:

bash
Copy
Edit
http://localhost:3000/api-docs
