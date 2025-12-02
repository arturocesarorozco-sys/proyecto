import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

/* ============================================================
   ENVIAR RECETA POR ID DE USUARIO
   ============================================================ */
router.post("/enviar", async (req, res) => {
  const { id_remitente, id_destinatario, id_mis_receta } = req.body;

  if (!id_remitente || !id_destinatario || !id_mis_receta) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const [result] = await pool.query(
      `
      INSERT INTO recetas_enviadas (id_remitente, id_destinatario, id_mis_receta)
      VALUES (?, ?, ?)
      `,
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
   ENVIAR POR CORREO
   ============================================================ */
router.post("/enviar-correo", async (req, res) => {
  const { id_remitente, id_mis_receta, correo_destino } = req.body;

  try {
    const [dest] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo_destino]
    );

    if (dest.length === 0)
      return res.status(404).json({ error: "El correo no está registrado" });

    const id_destinatario = dest[0].id_usuario;

    const [result] = await pool.query(
      `
      INSERT INTO recetas_enviadas (id_remitente, id_destinatario, id_mis_receta)
      VALUES (?, ?, ?)
      `,
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
   NOTIFICACIONES / RECETAS RECIBIDAS
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
   ACEPTAR RECETA
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

    // copiar receta base
    const [[recetaOriginal]] = await conn.query(
      `SELECT * FROM mis_recetas WHERE id_mis_receta = ?`,
      [id_mis_receta]
    );

    const [nuevaReceta] = await conn.query(
      `
      INSERT INTO mis_recetas 
      (id_usuario, titulo, descripcion, tiempo_preparacion, dificultad, porciones, id_categoria, imagen, es_vegetariana, es_vegana)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
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

    // ingredientes
    await conn.query(
      `
      INSERT INTO mis_receta_ingrediente (id_mis_receta, id_ingrediente, cantidad, unidad, nota)
      SELECT ?, id_ingrediente, cantidad, unidad, nota
      FROM mis_receta_ingrediente
      WHERE id_mis_receta = ?
      `,
      [idNueva, id_mis_receta]
    );

    // pasos
    await conn.query(
      `
      INSERT INTO mis_pasos_receta (id_mis_receta, numero_paso, descripcion, imagen_paso)
      SELECT ?, numero_paso, descripcion, imagen_paso
      FROM mis_pasos_receta
      WHERE id_mis_receta = ?
      `,
      [idNueva, id_mis_receta]
    );

    // marcar envío como aceptado
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

export default router;
