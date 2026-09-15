const Mesa = require('../models/Mesa');

/**
 * Persistencia en memoria de Mesas.
 * Mesa es una entidad de soporte en esta entrega: no expone CRUD propio,
 * pero ReservaService necesita consultarla para validar existencia y capacidad.
 */

const mesas = [
    new Mesa(1, 1, 2, 0, 0),
    new Mesa(2, 2, 4, 1, 0),
    new Mesa(3, 3, 6, 2, 0),
    new Mesa(4, 4, 8, 0, 1)
];

function findAll() {
    return mesas;
}

function findById(id) {
    return mesas.find((mesa) => mesa.id === id) || null;
}

module.exports = {
    findAll,
    findById
};
