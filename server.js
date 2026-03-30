const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db'); // Tu archivo de conexión a Railway

const app = express();
app.use(cors());
app.use(express.json());

// --- RUTA DE REGISTRO ---
app.post('/register', async (req, res) => {
    const { nombre, correo, numero, password, confirmarPassword } = req.body;

    // 1. Validaciones básicas
    if (!nombre || !correo || !numero || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    if (password !== confirmarPassword) {
        return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    try {
        // 2. Encriptar la contraseña (Hashing)
        // Esto convierte "12345" en algo como "$2a$10$X..."
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insertar en la base de datos de Railway
        const query = 'INSERT INTO usuarios1 (nombre, correo, numero, password) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [nombre, correo, numero, hashedPassword]);

        res.json({ mensaje: "¡Usuario guardado con éxito!", id: result.insertId });

    } catch (error) {
        // Si el correo ya existe, MySQL lanzará un error porque pusimos "Unique"
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Este correo ya está registrado" });
        }
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// --- RUTA DE LOGIN ---
app.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM usuarios1 WHERE correo = ?', [correo]);
        
        if (rows.length === 0) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const usuario = rows[0];

        // Comparar la contraseña escrita con la encriptada en la DB
        const esCorrecta = await bcrypt.compare(password, usuario.password);

        if (!esCorrecta) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        res.json({ 
            mensaje: "Inicio de sesión exitoso", 
            usuario: { nombre: usuario.nombre, correo: usuario.correo } 
        });

    } catch (error) {
        res.status(500).json({ error: "Error en el login" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
