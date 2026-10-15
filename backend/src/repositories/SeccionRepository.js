const Seccion = require('../models/Seccion');
const { createIdGenerator } = require('../utils/idGenerator');
const { secciones } = require('../data/cartaSeed');

const nextId = createIdGenerator(secciones.length + 1);

function findAll() {
    return secciones;
}

function findById(id) {
    return secciones.find((seccion) => seccion.id === id) || null;
}

function findByTitulo(titulo, carta) {
    const buscado = titulo.trim().toLowerCase();
    return secciones.find((seccion) => seccion.titulo.toLowerCase() === buscado && seccion.carta === carta) || null;
}

function findByPlatoId(platoId) {
    return secciones.filter((seccion) => seccion.platos.includes(platoId));
}

function create(datos) {
    const seccion = new Seccion(
        nextId(),
        datos.titulo,
        datos.orden,
        datos.platos,
        datos.carta,
        datos.grupo,
        datos.subtitulo,
        datos.nota
    );

    secciones.push(seccion);
    return seccion;
}

function update(id, datos) {
    const seccion = findById(id);
    if (!seccion) {
        return null;
    }

    Object.assign(seccion, datos);
    return seccion;
}

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
