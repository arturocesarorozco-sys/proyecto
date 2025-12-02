import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

/**
 * 🔹 AUTOCOMPLETADO DE INGREDIENTES
 */
router.get('/ingredientes/buscar', async (req, res) => {
  const { q } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT * FROM ingredientes
      WHERE nombre LIKE CONCAT('%', ?, '%')
      ORDER BY nombre
      LIMIT 10
    `, [q]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar ingredientes' });
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

    // Crear receta
    const [result] = await conn.query(`
      INSERT INTO mis_recetas 
      (id_usuario, titulo, descripcion, tiempo_preparacion, dificultad, porciones, id_categoria, imagen, es_vegetariana, es_vegana)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id_usuario, titulo, descripcion, tiempo_preparacion, dificultad, porciones, id_categoria, imagen, es_vegetariana, es_vegana]);

    const idReceta = result.insertId;

    // Guardar ingredientes
    for (const ing of ingredientes) {
      let idIngrediente = ing.id_ingrediente;

      if (!idIngrediente) {
        const [check] = await conn.query(`SELECT id_ingrediente FROM ingredientes WHERE nombre = ?`, [ing.nombre]);
        if (check.length > 0) {
          idIngrediente = check[0].id_ingrediente;
        } else {
          const [nuevo] = await conn.query(`
            INSERT INTO ingredientes (nombre, tipo, unidad_base)
            VALUES (?, ?, ?)
          `, [ing.nombre, ing.tipo || null, ing.unidad_base || null]);
          idIngrediente = nuevo.insertId;
        }
      }

      await conn.query(`
        INSERT INTO mis_receta_ingrediente (id_mis_receta, id_ingrediente, cantidad, unidad, nota)
        VALUES (?, ?, ?, ?, ?)
      `, [idReceta, idIngrediente, ing.cantidad || null, ing.unidad || null, ing.nota || null]);
    }

    // Guardar pasos
    for (let i = 0; i < pasos.length; i++) {
      const paso = pasos[i];
      await conn.query(`
        INSERT INTO mis_pasos_receta (id_mis_receta, numero_paso, descripcion, imagen_paso)
        VALUES (?, ?, ?, ?)
      `, [idReceta, i + 1, paso.descripcion, paso.imagen_paso || null]);
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

export default router;
