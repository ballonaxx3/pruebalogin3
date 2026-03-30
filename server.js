const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos usando las variables de Railway
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}).promise();

// ESTO ES PARA QUE EL LINK NO SALGA VACÍO
app.get('/', (req, res) => {
    res.send('<h1>🚀 Servidor de Login Funcionando</h1>');
});

// Ruta de Registro
app.post('/register', async (req, res) => {
    const { nombre, correo, numero, password, confirmarPassword } = req.body;
    if (password !== confirmarPassword) return res.status(400).json({ error: "No coinciden" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO usuarios1 (nombre, correo, numero, password) VALUES (?, ?, ?, ?)', 
        [nombre, correo, numero, hashedPassword]);
        res.json({ mensaje: "Usuario registrado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// El puerto debe ser dinámico para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});
