const Usuario = require('../models/Usuario');
const Rol = require('../enums/Rol');
const { createIdGenerator } = require('../utils/idGenerator');

/**
 * Persistencia en memoria de Usuarios.
 * CRUD puro sobre el array: no valida ni decide nada de negocio.
 */

const usuarios = [
    new Usuario(1, 'lucia.gomez@mail.com', '38123456', Rol.CLIENTE),
    new Usuario(2, 'martin.perez@mail.com', '40987654', Rol.CLIENTE),
    new Usuario(3, 'admin@pepediroma.com', '30111222', Rol.ADMIN)
];

const nextId = createIdGenerator(usuarios.length + 1);

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

/**
 * Sobrescribe solo las claves presentes en datos.
 * @returns {Usuario|null} el usuario actualizado, o null si no existe
 */
function update(id, datos) {
    const usuario = findById(id);
    if (!usuario) {
        return null;
    }

    Object.assign(usuario, datos);
    return usuario;
}

/**
 * @returns {Usuario|null} el usuario eliminado, o null si no existe
 */
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
