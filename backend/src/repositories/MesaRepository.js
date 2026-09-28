const Mesa = require('../models/Mesa');
const { createIdGenerator } = require('../utils/idGenerator');

/**
 * Persistencia en memoria de Mesas.
 * CRUD puro sobre el array: no valida ni decide nada de negocio.
 */

const mesas = [
    new Mesa(1, 1, 2, 0, 0),
    new Mesa(2, 2, 4, 1, 0),
    new Mesa(3, 3, 6, 2, 0),
    new Mesa(4, 4, 8, 0, 1)
];

const nextId = createIdGenerator(mesas.length + 1);

function findAll() {
    return mesas;
}

function findById(id) {
    return mesas.find((mesa) => mesa.id === id) || null;
}

function findByNumero(numero) {
    return mesas.find((mesa) => mesa.numero === numero) || null;
}

function create(datos) {
    const mesa = new Mesa(
        nextId(),
        datos.numero,
        datos.capacidad,
        datos.posicionX,
        datos.posicionY
    );

    mesas.push(mesa);
    return mesa;
}

/**
 * Sobrescribe solo las claves presentes en datos.
 * @returns {Mesa|null} la mesa actualizada, o null si no existe
 */
function update(id, datos) {
    const mesa = findById(id);
    if (!mesa) {
        return null;
    }

    Object.assign(mesa, datos);
    return mesa;
}

/**
 * @returns {Mesa|null} la mesa eliminada, o null si no existe
 */
function remove(id) {
    const indice = mesas.findIndex((mesa) => mesa.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminada] = mesas.splice(indice, 1);
    return eliminada;
}

module.exports = {
    findAll,
    findById,
    findByNumero,
    create,
    update,
    remove
};
