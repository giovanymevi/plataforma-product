const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const app = express();
const PORT = 3000;

// Conexión a MongoDB Atlas
// IMPORTANTE: Reemplaza <db_password> por tu contraseña real de Atlas
mongoose.connect('mongodb+srv://giovannymendozavillamizar1:Daewocielo1.@cluster0.ozvlt8g.mongodb.net/ecommerce?appName=Cluster0')
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Middleware para procesar JSON y archivos estáticos
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// --- Rutas de Autenticación ---

// Registro
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();
        
        res.json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });

        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// --- Rutas de Productos ---

// Obtener productos (opcionalmente filtrar por usuario)
app.get('/api/products', async (req, res) => {
    try {
        const userId = req.query.userId;
        const filter = userId ? { userId } : {};
        const products = await Product.find(filter);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo productos' });
    }
});

// Crear producto
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product({
            ...req.body,
            image: req.body.image || 'https://via.placeholder.com/300x200'
        });
        await newProduct.save();
        res.json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creando producto' });
    }
});

// Eliminar producto
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminando producto' });
    }
});

// Servir el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
