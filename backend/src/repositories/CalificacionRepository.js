const Calificacion = require('../models/Calificacion');
const { createIdGenerator } = require('../utils/idGenerator');

const calificaciones = [];

const nextId = createIdGenerator(calificaciones.length + 1);

function findAll() {
    return calificaciones;
}

function findById(id) {
    return calificaciones.find((calificacion) => calificacion.id === id) || null;
}

function findByUsuarioId(usuarioId) {
    return calificaciones.filter((calificacion) => calificacion.usuarioId === usuarioId);
}

function create(datos) {
    const calificacion = new Calificacion(
        nextId(),
        datos.usuarioId,
        datos.firma,
        datos.puntaje,
        datos.mensaje,
        datos.fecha,
        datos.platoId,
        datos.visible,
        datos.respuesta,
        { atencion: datos.atencion, comida: datos.comida, espacio: datos.espacio },
        datos.mozo
    );

    calificaciones.push(calificacion);
    return calificacion;
}

function update(id, datos) {
    const calificacion = findById(id);
    if (!calificacion) {
        return null;
    }

    Object.assign(calificacion, datos);
    return calificacion;
}

function remove(id) {
    const indice = calificaciones.findIndex((calificacion) => calificacion.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminada] = calificaciones.splice(indice, 1);
    return eliminada;
}

module.exports = {
    findAll,
    findById,
    findByUsuarioId,
    create,
    update,
    remove
};
