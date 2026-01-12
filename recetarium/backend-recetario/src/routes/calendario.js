import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

const inicioSemana = () => {
  const hoy = new Date();
  const dia = hoy.getDay() === 0 ? 7 : hoy.getDay();
  hoy.setDate(hoy.getDate() - dia + 1);
  hoy.setHours(0,0,0,0);
  return hoy.toISOString().slice(0,10);
};

/* ============================ */
/* ASIGNAR / REEMPLAZAR RECETA */
/* ============================ */
router.post("/asignar", async (req, res) => {
  const { id_usuario, dia, tipo_comida, id_mis_receta } = req.body;

  try {
    const fecha_semana = inicioSemana();

    await pool.query(
      `
      INSERT INTO calendario_recetas
      (id_usuario, id_mis_receta, dia, tipo_comida, fecha_semana)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        id_mis_receta = VALUES(id_mis_receta)
      `,
      [id_usuario, id_mis_receta, dia, tipo_comida, fecha_semana]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error asignando receta" });
  }
});

/* ============================ */
/* ELIMINAR RECETA */
/* ============================ */
router.post("/eliminar", async (req, res) => {
  const { id_usuario, dia, tipo_comida } = req.body;

  try {
    const fecha_semana = inicioSemana();

    await pool.query(
      `
      DELETE FROM calendario_recetas
      WHERE id_usuario = ?
        AND dia = ?
        AND tipo_comida = ?
        AND fecha_semana = ?
      `,
      [id_usuario, dia, tipo_comida, fecha_semana]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error eliminando receta" });
  }
});

/* ============================ */
/* OBTENER CALENDARIO */
/* ============================ */
router.get("/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;
  const fecha_semana = inicioSemana();

  try {
    const [rows] = await pool.query(
      `
      SELECT c.dia, c.tipo_comida, r.id_mis_receta, r.titulo, r.imagen
      FROM calendario_recetas c
      JOIN mis_recetas r ON r.id_mis_receta = c.id_mis_receta
      WHERE c.id_usuario = ? AND c.fecha_semana = ?
      `,
      [id_usuario, fecha_semana]
    );

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error cargando calendario" });
  }
});






router.post('/lista-compras/generar/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;

  const [rows] = await db.query(`
    SELECT 
      ing.nombre,
      SUM(mri.cantidad) AS cantidad,
      mri.unidad
    FROM calendario_recetas cr
    JOIN mis_recetas mr ON mr.id_mis_receta = cr.id_mis_receta
    JOIN mis_receta_ingrediente mri ON mri.id_mis_receta = mr.id_mis_receta
    JOIN ingredientes ing ON ing.id_ingrediente = mri.id_ingrediente
    WHERE cr.id_usuario = ?
      AND cr.fecha_semana = CURDATE()
    GROUP BY ing.nombre, mri.unidad
  `, [id_usuario]);

  await db.query(
    `DELETE FROM lista_compras WHERE id_usuario = ? AND generado_en = CURDATE()`,
    [id_usuario]
  );

  for (const item of rows) {
    await db.query(`
      INSERT INTO lista_compras 
      (id_usuario, nombre, cantidad, unidad, generado_en)
      VALUES (?, ?, ?, ?, CURDATE())
    `, [id_usuario, item.nombre, item.cantidad, item.unidad]);
  }

  res.json({ ok: true });
});


export default router;
