const express = require('express');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');

/**
 * Punto de entrada de la aplicacion.
 * Arma el server de Express, registra los middlewares, monta las rutas de la
 * API y deja el manejo de errores al final de la cadena.
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Parsea los bodies JSON de las requests entrantes.
app.use(express.json());

// Endpoint de cortesia para verificar que el server esta arriba.
app.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            app: 'Pepe Di Roma API',
            endpoints: ['/api/platos', '/api/reservas', '/api/pedidos']
        }
    });
});

// Rutas de la API: cada entidad cuelga de su propio prefijo.
app.use('/api', apiRoutes);

// Cualquier ruta no declarada arriba termina en un 404 con el formato de la app.
app.use(notFoundHandler);

// ULTIMO middleware: centraliza la respuesta de todos los errores.
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor Pepe Di Roma escuchando en http://localhost:${PORT}`);
});

module.exports = app;
