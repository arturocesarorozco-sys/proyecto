import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import recetasRoutes from './routes/recetas.js';
import usuariosRoutes from './routes/usuarios.js';
import misRecetasRoutes from './routes/misrecetas.js'; 
import agregarRecetasRoutes from './routes/agregarrecetas.js'; // <-- Importa tu nuevo archivo
import semanaRoutes from './routes/semana.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Crear pool de conexiones
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware para añadir db a req
app.use((req, res, next) => {
  req.db = db;
  next();
});


// Rutas principales
app.use('/api/recetas', recetasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/misrecetas', misRecetasRoutes);
app.use('/api/agregarrecetas', agregarRecetasRoutes); // <-- Agrega la ruta aquí
app.use('/api/semana', semanaRoutes);
// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
