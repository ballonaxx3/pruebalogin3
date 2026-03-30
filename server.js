const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión (Usando las variables que pusiste en Railway)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}).promise(); // El .promise() es vital para que funcione el 'await db.query'

// Ruta de prueba para ver en el navegador
app.get('/', (req, res) => {
    res.send('Servidor en línea y conectado a Railway');
});

// ... aquí sigue tu código de app.post('/register' ...
