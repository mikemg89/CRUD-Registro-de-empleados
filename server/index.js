const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "empleados_crud",
});

// Verificar conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado exitosamente a la base de datos');
});

// Middleware de manejo de errores de base de datos
const handleDatabaseError = (res, err, defaultMessage = "Error en la operación") => {
    console.error(defaultMessage, err);
    res.status(500).json({ 
        message: defaultMessage,
        error: err.message 
    });
};

// Crear nuevo empleado
app.post("/create", (req, res) => {
    const { nombre, edad, pais, cargo, anios } = req.body;

    // Validaciones básicas
    if (!nombre || !edad || !pais || !cargo || !anios) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    db.query(
        'INSERT INTO empleados(nombre, edad, pais, cargo, anios) VALUES(?, ?, ?, ?, ?)',
        [nombre, edad, pais, cargo, anios],
        (err, result) => {
            if (err) {
                return handleDatabaseError(res, err, "Error al registrar empleado");
            }
            
            res.status(201).json({
                message: "Empleado registrado con éxito",
                id: result.insertId
            });
        }
    );
});

// Obtener todos los empleados
app.get("/empleados", (req, res) => {
    db.query('SELECT * FROM empleados ORDER BY id DESC', 
        (err, result) => {
            if (err) {
                return handleDatabaseError(res, err, "Error al obtener empleados");
            }
            
            res.json(result);
        }
    );
});

// Actualizar empleado
app.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const { nombre, edad, pais, cargo, anios } = req.body;

    // Validaciones básicas
    if (!nombre || !edad || !pais || !cargo || !anios) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    db.query(
        'UPDATE empleados SET nombre=?, edad=?, pais=?, cargo=?, anios=? WHERE id=?',
        [nombre, edad, pais, cargo, anios, id],
        (err, result) => {
            if (err) {
                return handleDatabaseError(res, err, "Error al actualizar empleado");
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Empleado no encontrado" });
            }
            
            res.json({
                message: "Empleado actualizado con éxito",
                id: id
            });
        }
    );
});

// Eliminar empleado
app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        'DELETE FROM empleados WHERE id = ?',
        [id],
        (err, result) => {
            if (err) {
                return handleDatabaseError(res, err, "Error al eliminar empleado");
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Empleado no encontrado" });
            }
            
            res.json({
                message: "Empleado eliminado con éxito",
                id: id
            });
        }
    );
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: "Error interno del servidor",
        error: err.message 
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
});