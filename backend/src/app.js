const path = require('path');
const express = require('express');

// backend/.env guarda la configuración que no va al repositorio (la casilla de correo).
// Si el archivo no existe, el servidor arranca igual con los valores por defecto.
try {
    process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
    if (error.code !== 'ENOENT') {
        console.warn('[CONFIG] No se pudo leer backend/.env:', error.message);
    }
}

const apiRoutes = require('./routes');
const notFoundHandler = require('./middlewares/notFoundHandler');
const { identificar } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// el mail de difusión viaja con su foto embebida: necesita más que los 100 kb por defecto
app.use(express.json({ limit: '8mb' }));
app.use(identificar);

app.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            app: 'Pepe Di Roma API',
            endpoints: [
                '/api/usuarios',
                '/api/secciones',
                '/api/platos',
                '/api/mesas',
                '/api/reservas',
                '/api/pedidos',
                '/api/items-pedido',
                '/api/contenido',
                '/api/calificaciones',
                '/api/difusion',
                '/api/promociones'
            ]
        }
    });
});

app.use('/api', apiRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor Pepe Di Roma escuchando en http://localhost:${PORT}`);
});

module.exports = app;
