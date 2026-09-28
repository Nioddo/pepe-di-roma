const Plato = require('../models/Plato');
const { createIdGenerator } = require('../utils/idGenerator');

const platos = [
    new Plato(1, 'Milanesa napolitana', 9500, false, false, '/img/milanesa.jpg'),
    new Plato(2, 'Ravioles de ricota', 8700, true, false, '/img/ravioles.jpg'),
    new Plato(3, 'Ensalada Cesar', 6400, false, true, '/img/cesar.jpg')
];

const nextId = createIdGenerator(platos.length + 1);

function findAll() {
    return platos;
}

function findById(id) {
    return platos.find((plato) => plato.id === id) || null;
}

function findByNombre(nombre) {
    const buscado = nombre.trim().toLowerCase();
    return platos.find((plato) => plato.nombre.toLowerCase() === buscado) || null;
}

function create(datos) {
    const plato = new Plato(
        nextId(),
        datos.nombre,
        datos.precio,
        datos.vegano,
        datos.sinTacc,
        datos.imageUrl
    );

    platos.push(plato);
    return plato;
}

function update(id, datos) {
    const plato = findById(id);
    if (!plato) {
        return null;
    }

    Object.assign(plato, datos);
    return plato;
}

function remove(id) {
    const indice = platos.findIndex((plato) => plato.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminado] = platos.splice(indice, 1);
    return eliminado;
}

module.exports = {
    findAll,
    findById,
    findByNombre,
    create,
    update,
    remove
};
