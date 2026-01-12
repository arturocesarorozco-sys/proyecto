
import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

/**
 * 🔹 OBTENER TODAS LAS RECETAS DEL USUARIO
 */
router.get('/mis/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const [recetas] = await pool.query(`
      SELECT 
        r.*, 
        c.nombre AS categoria_nombre
      FROM mis_recetas r
      LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
      WHERE r.id_usuario = ?
      ORDER BY r.fecha_creacion DESC
    `, [id_usuario]);

    for (let receta of recetas) {
      const [ingredientes] = await pool.query(`
        SELECT 
          i.id_ingrediente, i.nombre, mri.cantidad, mri.unidad, mri.nota
        FROM mis_receta_ingrediente mri
        INNER JOIN ingredientes i ON mri.id_ingrediente = i.id_ingrediente
        WHERE mri.id_mis_receta = ?
      `, [receta.id_mis_receta]);

      const [pasos] = await pool.query(`
        SELECT numero_paso, descripcion, imagen_paso
        FROM mis_pasos_receta
        WHERE id_mis_receta = ?
        ORDER BY numero_paso ASC
      `, [receta.id_mis_receta]);

      receta.ingredientes = ingredientes;
      receta.pasos = pasos;
    }

    res.json(recetas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las recetas del usuario' });
  }
});


/**
 * 🔹 CREAR NUEVA RECETA
 */
router.post('/', async (req, res) => {
  const {
    id_usuario,
    titulo,
    descripcion,
    tiempo_preparacion,
    dificultad,
    porciones,
    id_categoria,
    imagen,
    es_vegetariana,
    es_vegana,
    ingredientes,
    pasos
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(`
      INSERT INTO mis_recetas 
      (id_usuario, titulo, descripcion, tiempo_preparacion, dificultad, porciones, id_categoria, imagen, es_vegetariana, es_vegana)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id_usuario, titulo, descripcion, tiempo_preparacion, dificultad, porciones, id_categoria, imagen, es_vegetariana, es_vegana]);

    const idReceta = result.insertId;

    // 🔸 Guardar ingredientes
    for (const ing of ingredientes) {
      let idIngrediente = ing.id_ingrediente;

      // Si el ingrediente no existe, crearlo
      if (!idIngrediente) {
        const [check] = await conn.query(`SELECT id_ingrediente FROM ingredientes WHERE nombre = ?`, [ing.nombre]);
        if (check.length > 0) {
          idIngrediente = check[0].id_ingrediente;
        } else {
          const [nuevo] = await conn.query(`
            INSERT INTO ingredientes (nombre, tipo, unidad_base)
            VALUES (?, ?, ?)
          `, [ing.nombre, ing.tipo, ing.unidad_base]);
          idIngrediente = nuevo.insertId;
        }
      }

      await conn.query(`
        INSERT INTO mis_receta_ingrediente (id_mis_receta, id_ingrediente, cantidad, unidad, nota)
        VALUES (?, ?, ?, ?, ?)
      `, [idReceta, idIngrediente, ing.cantidad, ing.unidad, ing.nota]);
    }

    // 🔸 Guardar pasos
    for (const paso of pasos) {
      await conn.query(`
        INSERT INTO mis_pasos_receta (id_mis_receta, numero_paso, descripcion, imagen_paso)
        VALUES (?, ?, ?, ?)
      `, [idReceta, paso.numero_paso, paso.descripcion, paso.imagen_paso]);
    }

    await conn.commit();
    res.status(201).json({ mensaje: 'Receta creada exitosamente', id_mis_receta: idReceta });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al crear la receta' });
  } finally {
    conn.release();
  }
});


/**
 * 🔹 ACTUALIZAR RECETA
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    titulo, descripcion, tiempo_preparacion, dificultad, porciones,
    id_categoria, imagen, es_vegetariana, es_vegana
  } = req.body;

  try {
    const [result] = await pool.query(`
      UPDATE mis_recetas 
      SET titulo = ?, descripcion = ?, tiempo_preparacion = ?, dificultad = ?, porciones = ?, 
          id_categoria = ?, imagen = ?, es_vegetariana = ?, es_vegana = ?
      WHERE id_mis_receta = ?
    `, [titulo, descripcion, tiempo_preparacion, dificultad, porciones, id_categoria, imagen, es_vegetariana, es_vegana, id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Receta no encontrada' });

    res.json({ mensaje: 'Receta actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar receta' });
  }
});


/**
 * 🔹 ELIMINAR RECETA
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM mis_recetas WHERE id_mis_receta = ?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Receta no encontrada' });

    res.json({ mensaje: 'Receta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar receta' });
  }
});


/**
 * 🔹 AUTOCOMPLETADO DE INGREDIENTES
 */
router.get('/ingredientes/buscar', async (req, res) => {
  const { q } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT * FROM ingredientes 
      WHERE nombre LIKE CONCAT('%', ?, '%')
      LIMIT 10
    `, [q]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar ingredientes' });
  }
});

router.post("/enviar", async (req, res) => {
  const { id_remitente, id_destinatario, id_mis_receta } = req.body;

  if (!id_remitente || !id_destinatario || !id_mis_receta) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO recetas_enviadas (id_remitente, id_destinatario, id_mis_receta)
       VALUES (?, ?, ?)`,
      [id_remitente, id_destinatario, id_mis_receta]
    );

    return res.json({
      mensaje: "Receta enviada correctamente",
      id_envio: result.insertId
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al enviar la receta" });
  }
});





/* ============================================================
   ENVIAR RECETA POR CORREO
   ============================================================ */
router.post("/enviar-correo", async (req, res) => {
  const { id_remitente, id_mis_receta, correo_destino } = req.body;

  if (!id_remitente || !id_mis_receta || !correo_destino) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const [dest] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo_destino]
    );

    if (dest.length === 0)
      return res.status(404).json({ error: "El correo no está registrado" });

    const id_destinatario = dest[0].id_usuario;

    const [result] = await pool.query(
      `INSERT INTO recetas_enviadas (id_remitente, id_destinatario, id_mis_receta)
       VALUES (?, ?, ?)`,
      [id_remitente, id_destinatario, id_mis_receta]
    );

    return res.json({
      mensaje: "Receta enviada correctamente",
      id_envio: result.insertId
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al enviar receta por correo" });
  }
});

/* ============================================================
   OBTENER RECETAS RECIBIDAS PENDIENTES
   ============================================================ */
router.get("/recibidas/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT re.id_envio, re.estado, re.fecha_envio,
             r.id_mis_receta, r.titulo, r.descripcion, r.imagen,
             u.nombre AS remitente_nombre
      FROM recetas_enviadas re
      INNER JOIN mis_recetas r ON re.id_mis_receta = r.id_mis_receta
      INNER JOIN usuarios u ON re.id_remitente = u.id_usuario
      WHERE re.id_destinatario = ? AND re.estado = 'pendiente'
    `, [id_usuario]);

    return res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener recetas recibidas" });
  }
});

/* ============================================================
   ACEPTAR RECETA (clonar a mis_recetas)
   ============================================================ */
router.post("/aceptar", async (req, res) => {
  const { id_envio } = req.body;

  try {
    const [[envio]] = await pool.query(
      `SELECT * FROM recetas_enviadas WHERE id_envio = ?`,
      [id_envio]
    );

    if (!envio)
      return res.status(404).json({ error: "Envío no encontrado" });

    const { id_destinatario, id_mis_receta } = envio;

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    // Copiar receta base
    const [[recetaOriginal]] = await conn.query(
      `SELECT * FROM mis_recetas WHERE id_mis_receta = ?`,
      [id_mis_receta]
    );

    const [nuevaReceta] = await conn.query(
      `INSERT INTO mis_recetas 
        (id_usuario, titulo, descripcion, tiempo_preparacion, dificultad, porciones, id_categoria, imagen, es_vegetariana, es_vegana)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_destinatario,
        recetaOriginal.titulo,
        recetaOriginal.descripcion,
        recetaOriginal.tiempo_preparacion,
        recetaOriginal.dificultad,
        recetaOriginal.porciones,
        recetaOriginal.id_categoria,
        recetaOriginal.imagen,
        recetaOriginal.es_vegetariana,
        recetaOriginal.es_vegana
      ]
    );

    const idNueva = nuevaReceta.insertId;

    // Clonar ingredientes
    await conn.query(
      `INSERT INTO mis_receta_ingrediente (id_mis_receta, id_ingrediente, cantidad, unidad, nota)
       SELECT ?, id_ingrediente, cantidad, unidad, nota
       FROM mis_receta_ingrediente
       WHERE id_mis_receta = ?`,
      [idNueva, id_mis_receta]
    );

    // Clonar pasos
    await conn.query(
      `INSERT INTO mis_pasos_receta (id_mis_receta, numero_paso, descripcion, imagen_paso)
       SELECT ?, numero_paso, descripcion, imagen_paso
       FROM mis_pasos_receta
       WHERE id_mis_receta = ?`,
      [idNueva, id_mis_receta]
    );

    // Marcar envío como aceptado
    await conn.query(
      `UPDATE recetas_enviadas SET estado = 'aceptada' WHERE id_envio = ?`,
      [id_envio]
    );

    await conn.commit();
    conn.release();

    return res.json({ mensaje: "Receta aceptada y agregada a tus recetas" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al aceptar receta" });
  }
});

/* ============================================================
   RECHAZAR RECETA
   ============================================================ */
router.post("/rechazar", async (req, res) => {
  const { id_envio } = req.body;

  try {
    await pool.query(
      `UPDATE recetas_enviadas SET estado = 'rechazada' WHERE id_envio = ?`,
      [id_envio]
    );

    return res.json({ mensaje: "Receta rechazada" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al rechazar receta" });
  }
});

/**
 * 🔹 FILTRAR RECETAS DEL USUARIO
 */
router.get('/filtrar', async (req, res) => {
  const { id_usuario, nombre = '', id_categoria = '', vegana = '', vegetariana = '' } = req.query;

  if (!id_usuario)
    return res.status(400).json({ error: "Falta id_usuario" });

  try {
    let query = `
      SELECT r.*, c.nombre AS categoria_nombre
      FROM mis_recetas r
      LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
      WHERE r.id_usuario = ?
    `;

    const params = [id_usuario];

    if (nombre) {
      query += " AND r.titulo LIKE ?";
      params.push(`%${nombre}%`);
    }

    if (id_categoria) {
      query += " AND r.id_categoria = ?";
      params.push(id_categoria);
    }

    if (vegana !== '') {
      query += " AND r.es_vegana = ?";
      params.push(vegana);
    }

    if (vegetariana !== '') {
      query += " AND r.es_vegetariana = ?";
      params.push(vegetariana);
    }

    query += " ORDER BY r.fecha_creacion DESC";

    const [recetas] = await pool.query(query, params);

    return res.json(recetas);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al filtrar recetas" });
  }
});




router.post('/publicar', async (req, res) => {
  const { id_mis_receta } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[receta]] = await conn.query(
      `SELECT * FROM mis_recetas WHERE id_mis_receta = ?`,
      [id_mis_receta]
    );

    if (!receta) return res.status(404).json({ error: 'No encontrada' });

    const [pub] = await conn.query(`
      INSERT INTO recetas
      (titulo, descripcion, tiempo_preparacion, dificultad, porciones,
       id_categoria, imagen, es_vegetariana, es_vegana)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
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

    const idReceta = pub.insertId;

    await conn.query(`
      INSERT INTO receta_ingrediente (id_receta, id_ingrediente, cantidad, unidad, nota)
      SELECT ?, id_ingrediente, cantidad, unidad, nota
      FROM mis_receta_ingrediente
      WHERE id_mis_receta = ?
    `, [idReceta, id_mis_receta]);

    await conn.query(`
      INSERT INTO pasos_receta (id_receta, numero_paso, descripcion, imagen_paso)
      SELECT ?, numero_paso, descripcion, imagen_paso
      FROM mis_pasos_receta
      WHERE id_mis_receta = ?
    `, [idReceta, id_mis_receta]);

    await conn.commit();
    res.json({ mensaje: 'Receta publicada' });

  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: 'Error al publicar' });
  } finally {
    conn.release();
  }
});

export default router;
