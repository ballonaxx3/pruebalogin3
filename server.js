const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Conexión a Railway
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// --- RUTA DE REGISTRO ---
app.post('/register', async (req, res) => {
    const { nombre, correo, numero, password, confirmarPassword } = req.body;

    if (password !== confirmarPassword) {
        return res.status(400).json({ msg: "Las contraseñas no coinciden" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO usuarios1 (nombre, correo, numero, password) VALUES (?, ?, ?, ?)";
        
        db.query(query, [nombre, correo, numero, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ error: "El correo ya existe" });
            res.status(201).json({ msg: "Usuario creado con éxito" });
        });
    } catch (error) {
        res.status(500).send("Error en el servidor");
    }
});

// --- RUTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { correo, password } = req.body;

    db.query("SELECT * FROM usuarios1 WHERE correo = ?", [correo], async (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ msg: "Usuario no encontrado" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { nombre: user.nombre, correo: user.correo } });
    });
});

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));