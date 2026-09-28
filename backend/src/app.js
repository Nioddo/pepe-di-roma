const express = require('express');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
                '/api/items-pedido'
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
