import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// ============================
// OBTENER TODOS LOS USUARIOS
// ============================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// ============================
// CREAR USUARIO (REGISTRO)
// ============================
router.post('/', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)',
      [nombre, correo, contraseña]
    );
    res.status(201).json({ id: result.insertId, nombre, correo });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// ============================
// LOGIN
// ============================
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = rows[0];

    if (contraseña !== usuario.contraseña) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Retornamos los datos del usuario (sin la contraseña)
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        foto_perfil: usuario.foto_perfil
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ============================
// ACTUALIZAR USUARIO
// ============================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, foto_perfil } = req.body;

  if (!nombre || !correo) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET nombre = ?, correo = ?, foto_perfil = ? WHERE id_usuario = ?',
      [nombre, correo, foto_perfil || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      mensaje: 'Usuario actualizado correctamente', 
      usuario: { id_usuario: id, nombre, correo, foto_perfil } 
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// ============================
// OBTENER USUARIO POR ID (opcional, útil para recetas)
// ============================
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id_usuario, nombre, correo, foto_perfil FROM usuarios WHERE id_usuario = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

export default router;
