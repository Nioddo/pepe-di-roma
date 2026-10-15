const Contenido = require('../models/Contenido');
const { createIdGenerator } = require('../utils/idGenerator');
const semilla = require('../data/contenidoSeed');

const contenidos = semilla.map((item) => new Contenido(item.id, item.clave, item.valor));

const nextId = createIdGenerator(contenidos.length + 1);

function findAll() {
    return contenidos;
}

function findById(id) {
    return contenidos.find((contenido) => contenido.id === id) || null;
}

function findByClave(clave) {
    return contenidos.find((contenido) => contenido.clave === clave) || null;
}

function create(datos) {
    const contenido = new Contenido(nextId(), datos.clave, datos.valor);

    contenidos.push(contenido);
    return contenido;
}

function update(id, datos) {
    const contenido = findById(id);
    if (!contenido) {
        return null;
    }

    Object.assign(contenido, datos);
    return contenido;
}

function remove(id) {
    const indice = contenidos.findIndex((contenido) => contenido.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminado] = contenidos.splice(indice, 1);
    return eliminado;
}

module.exports = {
    findAll,
    findById,
    findByClave,
    create,
    update,
    remove
};
