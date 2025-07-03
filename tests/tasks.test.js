//Importa Supertest, una librería que te permite hacer solicitudes HTTP (como GET, POST, etc.) 
// a tu servidor sin necesidad de tenerlo realmente corriendo en un puerto.
const request = require('supertest');
const { describe } = require('node:test');
const app = require('../index'); // Importa tu aplicación Express

describe('GET /tasks', () => {
  it('Debe devolver todas las tareas', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /tasks', () => {
  it('Debe crear una nueva tarea', async () => {
    const newTask = {
      title: 'Nueva tarea',
      description: 'Descripción de la nueva tarea',
      status: 'pending'
    };
    
    const res = await request(app)
      .post('/tasks')
      .send(newTask);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toEqual(newTask.title);
    expect(res.body.description).toEqual(newTask.description);
    expect(res.body.status).toEqual(newTask.status);
  });

  it('Debe devolver un error 400 si los datos son inválidos', async () => {
    const invalidTask = {
      title: '',
      status: 'invalid_status'
    };
    
    const res = await request(app)
      .post('/tasks')
      .send(invalidTask);
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Datos inválidos');
  });
});

describe('PUT /tasks/:id', () => {
  it('Debe actualizar una tarea existente', async () => {
    const newTask = {
      title: 'Tarea a actualizar',
      description: 'Descripción de la tarea a actualizar',
      status: 'pending'
    };

    const createRes = await request(app)
      .post('/tasks')
        .send(newTask);
    const taskId = createRes.body.id;

    const updatedData = {
      title: 'Tarea actualizada',
        description: 'Descripción actualizada',
        status: 'done'
    };
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual(updatedData.title);
    expect(res.body.description).toEqual(updatedData.description);
    expect(res.body.status).toEqual(updatedData.status);
  });

});

describe('DELETE /tasks/:id', () => {
  it('Debe eliminar una tarea existente', async () => {
    // Primero, crea una tarea para eliminar
    const newTask = {
      title: 'Tarea a eliminar',
      description: 'Descripción de la tarea a eliminar',
      status: 'pending'
    };
    
    const createRes = await request(app)
      .post('/tasks')
      .send(newTask);
    
    const taskId = createRes.body.id;

    // Ahora, elimina la tarea creada
    const res = await request(app).delete(`/tasks/${taskId}`);
    
    expect(res.statusCode).toEqual(204);
  });

  it('Debe devolver un error 404 si la tarea no existe', async () => {
    const res = await request(app).delete('/tasks/999999');
    
    expect(res.statusCode).toEqual(404);
  });
}); 