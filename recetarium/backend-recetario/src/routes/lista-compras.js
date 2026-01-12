import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

/* ============================
   Obtener inicio de semana
   ============================ */
const inicioSemana = () => {
  const hoy = new Date();
  const dia = hoy.getDay() === 0 ? 7 : hoy.getDay();
  hoy.setDate(hoy.getDate() - dia + 1);
  hoy.setHours(0,0,0,0);
  return hoy.toISOString().slice(0,10);
};

/* =====================================================
   GENERAR + OBTENER LISTA DE COMPRAS SEMANAL
   ===================================================== */
router.get("/generar/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;
  const fecha_semana = inicioSemana();

  try {
    /* 1️⃣ Obtener ingredientes sumados */
    const [ingredientes] = await pool.query(`
      SELECT
        ing.nombre,
        SUM(mri.cantidad) AS cantidad,
        mri.unidad
      FROM calendario_recetas cr
      INNER JOIN mis_receta_ingrediente mri
        ON cr.id_mis_receta = mri.id_mis_receta
      INNER JOIN ingredientes ing
        ON ing.id_ingrediente = mri.id_ingrediente
      WHERE cr.id_usuario = ?
        AND cr.fecha_semana = ?
      GROUP BY ing.nombre, mri.unidad
      ORDER BY ing.nombre
    `, [id_usuario, fecha_semana]);

    /* 2️⃣ Limpiar lista previa de la semana */
    await pool.query(`
      DELETE FROM lista_compras
      WHERE id_usuario = ?
        AND generado_en = ?
    `, [id_usuario, fecha_semana]);

    /* 3️⃣ Insertar nueva lista */
    for (const item of ingredientes) {
      await pool.query(`
        INSERT INTO lista_compras
        (id_usuario, nombre, cantidad, unidad, generado_en)
        VALUES (?, ?, ?, ?, ?)
      `, [
        id_usuario,
        item.nombre,
        item.cantidad,
        item.unidad,
        fecha_semana
      ]);
    }

    /* 4️⃣ Devolver lista generada */
    res.json(ingredientes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando lista de compras" });
  }
});


export default router;
