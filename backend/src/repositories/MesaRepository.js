const Mesa = require('../models/Mesa');
const { createIdGenerator } = require('../utils/idGenerator');

// posicionX / posicionY: esquina de arriba a la izquierda de la mesa, en unidades del plano (100 ≈ 1 metro)
const mesas = [
    new Mesa(1, 1, 4, 110, 150),
    new Mesa(2, 2, 4, 360, 150),
    new Mesa(3, 3, 4, 610, 150),
    new Mesa(4, 4, 4, 110, 380),
    new Mesa(5, 5, 6, 348, 380),
    new Mesa(6, 6, 6, 598, 380)
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

function update(id, datos) {
    const mesa = findById(id);
    if (!mesa) {
        return null;
    }

    Object.assign(mesa, datos);
    return mesa;
}

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
