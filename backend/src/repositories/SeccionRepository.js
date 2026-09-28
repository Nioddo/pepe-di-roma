const Seccion = require('../models/Seccion');
const { createIdGenerator } = require('../utils/idGenerator');

/**
 * Persistencia en memoria de Secciones de la carta.
 * Cada seccion guarda la lista de IDs de los platos que agrupa.
 * CRUD puro sobre el array: no valida ni decide nada de negocio.
 */

const secciones = [
    new Seccion(1, 'Principales', 1, [1]),
    new Seccion(2, 'Pastas', 2, [2]),
    new Seccion(3, 'Ensaladas', 3, [3])
];

const nextId = createIdGenerator(secciones.length + 1);

function findAll() {
    return secciones;
}

function findById(id) {
    return secciones.find((seccion) => seccion.id === id) || null;
}

function findByTitulo(titulo) {
    const buscado = titulo.trim().toLowerCase();
    return secciones.find((seccion) => seccion.titulo.toLowerCase() === buscado) || null;
}

/** Secciones que incluyen un plato dado. La usa PlatoService antes de borrar. */
function findByPlatoId(platoId) {
    return secciones.filter((seccion) => seccion.platos.includes(platoId));
}

function create(datos) {
    const seccion = new Seccion(nextId(), datos.titulo, datos.orden, datos.platos);

    secciones.push(seccion);
    return seccion;
}

/**
 * Sobrescribe solo las claves presentes en datos.
 * @returns {Seccion|null} la seccion actualizada, o null si no existe
 */
function update(id, datos) {
    const seccion = findById(id);
    if (!seccion) {
        return null;
    }

    Object.assign(seccion, datos);
    return seccion;
}

/**
 * @returns {Seccion|null} la seccion eliminada, o null si no existe
 */
function remove(id) {
    const indice = secciones.findIndex((seccion) => seccion.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminada] = secciones.splice(indice, 1);
    return eliminada;
}

module.exports = {
    findAll,
    findById,
    findByTitulo,
    findByPlatoId,
    create,
    update,
    remove
};
