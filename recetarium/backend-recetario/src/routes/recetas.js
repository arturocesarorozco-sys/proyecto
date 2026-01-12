// routes/recetas.js
import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

/**
 * GET /api/recetas
 * Filtros: categoría, search, vegana, vegetariana
 */
router.get('/', async (req, res) => {
  try {
    const { categoria, search, es_vegana, es_vegetariana } = req.query;

    let query = `
      SELECT 
        r.id_receta,
        r.titulo,
        r.descripcion,
        r.tiempo_preparacion,
        r.porciones,
        r.dificultad,
        r.imagen,
        r.es_vegana,
        r.es_vegetariana,
        c.nombre AS categoria
      FROM recetas r
      JOIN categorias c ON c.id_categoria = r.id_categoria
      WHERE 1 = 1
    `;
    const params = [];

    if (categoria) {
      query += " AND r.id_categoria = ? ";
      params.push(categoria);
    }

    if (search) {
      query += " AND r.titulo LIKE ? ";
      params.push(`%${search}%`);
    }

    if (es_vegana === "1") {
      query += " AND r.es_vegana = 1 ";
    }

    if (es_vegetariana === "1") {
      query += " AND r.es_vegetariana = 1 ";
    }

    query += " ORDER BY r.id_receta ASC;";

    const [rows] = await pool.query(query, params);
    res.json(rows);

  } catch (err) {
    console.error("Error filtros recetas:", err);
    res.status(500).json({ error: "Error en filtros de recetas" });
  }
});

/**
 * GET /api/recetas/populares
 */
router.get('/populares', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.id_receta,
        r.titulo,
        r.descripcion,
        r.tiempo_preparacion,
        r.porciones,
        r.dificultad,
        r.imagen,
        r.es_vegana,
        r.es_vegetariana,
        c.nombre AS categoria
      FROM recetas r
      JOIN categorias c ON c.id_categoria = r.id_categoria
      ORDER BY r.id_receta DESC
      LIMIT 6;
    `);

    res.json(rows);

  } catch (err) {
    console.error('Error populares:', err);
    res.status(500).json({ error: 'Error al obtener recetas populares' });
  }
});

/**
 * GET /api/recetas/:id
 * Detalles de receta
 */
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const [[receta]] = await pool.query(`
      SELECT 
        r.id_receta,
        r.titulo,
        r.descripcion,
        r.tiempo_preparacion,
        r.porciones,
        r.dificultad,
        r.imagen,
        r.es_vegana,
        r.es_vegetariana,
        c.nombre AS categoria
      FROM recetas r
      JOIN categorias c ON c.id_categoria = r.id_categoria
      WHERE r.id_receta = ?;
    `, [id]);

    if (!receta) return res.status(404).json({ error: "Receta no encontrada" });

    const [ingredientes] = await pool.query(`
      SELECT i.nombre, ri.cantidad, ri.unidad, ri.nota
      FROM receta_ingrediente ri
      JOIN ingredientes i ON i.id_ingrediente = ri.id_ingrediente
      WHERE ri.id_receta = ?
      ORDER BY ri.id_receta_ingrediente;
    `, [id]);

    const [pasos] = await pool.query(`
      SELECT numero_paso, descripcion
      FROM pasos_receta
      WHERE id_receta = ?
      ORDER BY numero_paso;
    `, [id]);

    res.json({ receta, ingredientes, pasos });

  } catch (err) {
    console.error("Error detalles:", err);
    res.status(500).json({ error: "Error al obtener detalles" });
  }
});

/**
 * GET /api/recetas/:id/social
 * Comentarios y likes de receta
 */
router.get('/:id/social', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const [comentarios] = await pool.query(`
      SELECT c.id_comentario, c.comentario, c.fecha,
             u.id_usuario, u.nombre, u.foto_perfil
      FROM comentarios c
      LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
      WHERE c.id_receta = ?
      ORDER BY c.fecha DESC;
    `, [id]);

    const [[likes]] = await pool.query(`
      SELECT COUNT(*) AS total_likes
      FROM likes_recetas
      WHERE id_receta = ?;
    `, [id]);

    res.json({ comentarios, likes: likes.total_likes });

  } catch (err) {
    console.error("Error social:", err);
    res.status(500).json({ error: "Error al obtener comentarios/likes" });
  }
});

/**
 * POST /api/recetas/comentar
 * Agregar comentario
 */
router.post('/comentar', async (req, res) => {
  const id_usuario = Number(req.body.id_usuario);
  const id_receta = Number(req.body.id_receta);
  const comentario = req.body.comentario?.trim();

  if (!id_usuario || !id_receta || !comentario) {
    return res.status(400).json({ error: "Faltan datos o son inválidos" });
  }

  try {
    console.log("Nuevo comentario:", { id_usuario, id_receta, comentario });

    await pool.query(`
      INSERT INTO comentarios(id_usuario, id_receta, comentario)
      VALUES(?, ?, ?)
    `, [id_usuario, id_receta, comentario]);

    // Devolver comentarios actualizados
    const [comentarios] = await pool.query(`
      SELECT c.id_comentario, c.comentario, c.fecha,
             u.id_usuario, u.nombre, u.foto_perfil
      FROM comentarios c
      LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
      WHERE c.id_receta = ?
      ORDER BY c.fecha DESC;
    `, [id_receta]);

    res.json({ ok: true, comentarios });

  } catch (err) {
    console.error("Error comentar:", err);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

/**
 * POST /api/recetas/like
 * Dar o quitar like
 */
router.post('/like', async (req, res) => {
  const id_usuario = Number(req.body.id_usuario);
  const id_receta = Number(req.body.id_receta);

  if (!id_usuario || !id_receta) {
    return res.status(400).json({ error: "Faltan datos o son inválidos" });
  }

  try {
    console.log("Like recibido:", { id_usuario, id_receta });

    // Verificar si ya existe like
    const [[existe]] = await pool.query(`
      SELECT id_like FROM likes_recetas
      WHERE id_usuario = ? AND id_receta = ?
    `, [id_usuario, id_receta]);

    let liked;

    if (existe) {
      await pool.query(`
        DELETE FROM likes_recetas
        WHERE id_usuario = ? AND id_receta = ?
      `, [id_usuario, id_receta]);
      liked = false;
    } else {
      await pool.query(`
        INSERT INTO likes_recetas(id_usuario, id_receta)
        VALUES(?, ?)
      `, [id_usuario, id_receta]);
      liked = true;
    }

    // Devolver likes actualizados
    const [[likes]] = await pool.query(`
      SELECT COUNT(*) AS total_likes
      FROM likes_recetas
      WHERE id_receta = ?;
    `, [id_receta]);

    res.json({ liked, likes: likes.total_likes });

  } catch (err) {
    console.error("Error like:", err);
    res.status(500).json({ error: "Error al actualizar like" });
  }
});



router.post('/agregar-a-mis', async (req, res) => {
  const { id_usuario, id_receta } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[receta]] = await conn.query(
      `SELECT * FROM recetas WHERE id_receta = ?`,
      [id_receta]
    );

    if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });

    const [nueva] = await conn.query(`
      INSERT INTO mis_recetas
      (id_usuario, titulo, descripcion, tiempo_preparacion, dificultad, porciones,
       id_categoria, imagen, es_vegetariana, es_vegana)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id_usuario,
      receta.titulo,
      receta.descripcion,
      receta.tiempo_preparacion,
      receta.dificultad,
      receta.porciones,
      receta.id_categoria,
      receta.imagen,
      receta.es_vegetariana,
      receta.es_vegana
    ]);

    const idNueva = nueva.insertId;

    await conn.query(`
      INSERT INTO mis_receta_ingrediente (id_mis_receta, id_ingrediente, cantidad, unidad, nota)
      SELECT ?, id_ingrediente, cantidad, unidad, nota
      FROM receta_ingrediente
      WHERE id_receta = ?
    `, [idNueva, id_receta]);

    await conn.query(`
      INSERT INTO mis_pasos_receta (id_mis_receta, numero_paso, descripcion, imagen_paso)
      SELECT ?, numero_paso, descripcion, imagen_paso
      FROM pasos_receta
      WHERE id_receta = ?
    `, [idNueva, id_receta]);

    await conn.commit();
    res.json({ mensaje: 'Receta agregada a tus recetas' });

  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: 'Error al agregar receta' });
  } finally {
    conn.release();
  }
});


export default router;
