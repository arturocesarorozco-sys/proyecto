// routes/semana.js
import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

/**
 * 🔹 CONVERTIR NOMBRE DE DÍA A ÍNDICE
 */
const diaANum = (dia) => {
  const map = {
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
    Domingo: 7,
  };
  return map[dia] ?? 0;
};

/**
 * ============================================================
 * 🔹 CREAR NUEVA SEMANA PARA UN USUARIO
 * ============================================================
 */
router.post("/crear", async (req, res) => {
  const { id_usuario, fecha_inicio, fecha_fin } = req.body;

  if (!id_usuario || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const [result] = await pool.query(
      `
      INSERT INTO semana_recetas (id_usuario, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?)
    `,
      [id_usuario, fecha_inicio, fecha_fin]
    );

    res.json({
      mensaje: "Semana creada correctamente",
      id_semana: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear semana" });
  }
});

/**
 * ============================================================
 * 🔹 OBTENER TODAS LAS SEMANAS DEL USUARIO
 * ============================================================
 */
router.get("/usuario/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT * FROM semana_recetas
      WHERE id_usuario = ?
      ORDER BY fecha_inicio DESC
    `,
      [id_usuario]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener semanas" });
  }
});

/**
 * ============================================================
 * 🔹 AGREGAR RECETA A UN DÍA
 * ============================================================
 */
router.post("/agregar", async (req, res) => {
  const { id_semana, id_mis_receta, dia, tipo_comida } = req.body;

  if (!id_semana || !id_mis_receta || !dia || !tipo_comida) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const [result] = await pool.query(
      `
      INSERT INTO semana_receta_detalle
      (id_semana, id_mis_receta, dia, tipo_comida)
      VALUES (?, ?, ?, ?)
    `,
      [id_semana, id_mis_receta, dia, tipo_comida]
    );

    res.json({
      mensaje: "Receta agregada correctamente al día",
      id_detalle: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al agregar receta a semana" });
  }
});

/**
 * ============================================================
 * 🔹 OBTENER DETALLE COMPLETO DE UNA SEMANA
 * ============================================================
 */
router.get("/:id_semana", async (req, res) => {
  const { id_semana } = req.params;

  try {
    const [semana] = await pool.query(
      `SELECT * FROM semana_recetas WHERE id_semana = ?`,
      [id_semana]
    );

    if (semana.length === 0)
      return res.status(404).json({ error: "Semana no encontrada" });

    const [detalles] = await pool.query(
      `
      SELECT d.*, r.titulo, r.descripcion, r.imagen
      FROM semana_receta_detalle d
      INNER JOIN mis_recetas r ON d.id_mis_receta = r.id_mis_receta
      WHERE d.id_semana = ?
      ORDER BY FIELD(d.dia,
        'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'
      ),
      FIELD(tipo_comida, 'Desayuno','Comida','Cena')
    `,
      [id_semana]
    );

    res.json({
      semana: semana[0],
      detalle: detalles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener detalle de semana" });
  }
});

/**
 * ============================================================
 * 🔹 ACTUALIZAR UNA RECETA DEL DÍA
 * ============================================================
 */
router.put("/actualizar/:id_detalle", async (req, res) => {
  const { id_detalle } = req.params;
  const { id_mis_receta } = req.body;

  try {
    const [result] = await pool.query(
      `
      UPDATE semana_receta_detalle
      SET id_mis_receta = ?
      WHERE id_detalle = ?
    `,
      [id_mis_receta, id_detalle]
    );

    res.json({
      mensaje: "Receta actualizada correctamente en la semana",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar receta del día" });
  }
});

/**
 * ============================================================
 * 🔹 ELIMINAR UNA RECETA DEL DÍA
 * ============================================================
 */
router.delete("/eliminar/:id_detalle", async (req, res) => {
  const { id_detalle } = req.params;

  try {
    await pool.query(
      `DELETE FROM semana_receta_detalle WHERE id_detalle = ?`,
      [id_detalle]
    );

    res.json({ mensaje: "Receta eliminada del día correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar receta del día" });
  }
});

/**
 * ============================================================
 * 🔹 ELIMINAR SEMANA COMPLETA
 * ============================================================
 */
router.delete("/semana/:id_semana", async (req, res) => {
  const { id_semana } = req.params;

  try {
    await pool.query(`DELETE FROM semana_recetas WHERE id_semana = ?`, [
      id_semana,
    ]);

    res.json({ mensaje: "Semana eliminada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar semana" });
  }
});



export default router;
