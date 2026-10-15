const Usuario = require('../models/Usuario');
const Rol = require('../enums/Rol');
const { createIdGenerator } = require('../utils/idGenerator');
const historial = require('../data/historialSeed');

const usuarios = [
    new Usuario(1, 'cliente@pepediroma.com.ar', '38123456', Rol.CLIENTE),
    new Usuario(2, 'martin.perez@mail.com', '40987654', Rol.CLIENTE),
    new Usuario(3, 'admin@pepediroma.com.ar', '30111222', Rol.ADMIN),
    ...historial.usuarios.map((u) => new Usuario(u.id, u.email, u.dni, u.rol))
];

const nextId = createIdGenerator(Math.max(...usuarios.map((u) => u.id)) + 1);

function findAll() {
    return usuarios;
}

function findById(id) {
    return usuarios.find((usuario) => usuario.id === id) || null;
}

function findByEmail(email) {
    const buscado = email.trim().toLowerCase();
    return usuarios.find((usuario) => usuario.email.toLowerCase() === buscado) || null;
}

function findByDni(dni) {
    return usuarios.find((usuario) => usuario.dni === dni) || null;
}

function create(datos) {
    const usuario = new Usuario(nextId(), datos.email, datos.dni, datos.rol);

    usuarios.push(usuario);
    return usuario;
}

function update(id, datos) {
    const usuario = findById(id);
    if (!usuario) {
        return null;
    }

    Object.assign(usuario, datos);
    return usuario;
}

function remove(id) {
    const indice = usuarios.findIndex((usuario) => usuario.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminado] = usuarios.splice(indice, 1);
    return eliminado;
}

module.exports = {
    findAll,
    findById,
    findByEmail,
    findByDni,
    create,
    update,
    remove
};
