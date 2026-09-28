const UsuarioRepository = require('../repositories/UsuarioRepository');
const ReservaRepository = require('../repositories/ReservaRepository');
const PedidoRepository = require('../repositories/PedidoRepository');
const Messages = require('../enums/Messages');
const Rol = require('../enums/Rol');
const { BadRequestError, NotFoundError, ConflictError } = require('../exceptions/AppError');

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORMATO_DNI = /^\d{7,8}$/;

function parsearId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return numero;
}

function validarEmail(email) {
    if (typeof email !== 'string' || !FORMATO_EMAIL.test(email.trim())) {
        throw new BadRequestError(Messages.USUARIO_EMAIL_INVALID);
    }
    return email.trim().toLowerCase();
}

function validarDni(dni) {
    const texto = typeof dni === 'number' ? String(dni) : dni;
    if (typeof texto !== 'string' || !FORMATO_DNI.test(texto.trim())) {
        throw new BadRequestError(Messages.USUARIO_DNI_INVALID);
    }
    return texto.trim();
}

function validarRol(rol) {
    if (!Object.values(Rol).includes(rol)) {
        throw new BadRequestError(Messages.USUARIO_ROL_INVALID);
    }
    return rol;
}

function validarEmailDisponible(email, idAExcluir = null) {
    const existente = UsuarioRepository.findByEmail(email);
    if (existente && existente.id !== idAExcluir) {
        throw new ConflictError(Messages.USUARIO_EMAIL_DUPLICATED);
    }
}

function validarDniDisponible(dni, idAExcluir = null) {
    const existente = UsuarioRepository.findByDni(dni);
    if (existente && existente.id !== idAExcluir) {
        throw new ConflictError(Messages.USUARIO_DNI_DUPLICATED);
    }
}

function obtenerTodos() {
    return UsuarioRepository.findAll();
}

function obtenerPorId(id) {
    const usuarioId = parsearId(id);
    const usuario = UsuarioRepository.findById(usuarioId);

    if (!usuario) {
        throw new NotFoundError(Messages.USUARIO_NOT_FOUND);
    }

    return usuario;
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const email = validarEmail(body.email);
    const dni = validarDni(body.dni);
    const rol = body.rol === undefined ? Rol.CLIENTE : validarRol(body.rol);

    validarEmailDisponible(email);
    validarDniDisponible(dni);

    return UsuarioRepository.create({ email, dni, rol });
}

function modificar(id, body) {
    const usuario = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const cambios = {};

    if (body.email !== undefined) {
        cambios.email = validarEmail(body.email);
        validarEmailDisponible(cambios.email, usuario.id);
    }
    if (body.dni !== undefined) {
        cambios.dni = validarDni(body.dni);
        validarDniDisponible(cambios.dni, usuario.id);
    }
    if (body.rol !== undefined) {
        cambios.rol = validarRol(body.rol);
    }

    return UsuarioRepository.update(usuario.id, cambios);
}

function eliminar(id) {
    const usuario = obtenerPorId(id);

    const tieneReservas = ReservaRepository.findByClienteId(usuario.id).length > 0;
    const tienePedidos = PedidoRepository.findByClienteId(usuario.id).length > 0;

    if (tieneReservas || tienePedidos) {
        throw new ConflictError(Messages.USUARIO_CON_REFERENCIAS);
    }

    return UsuarioRepository.remove(usuario.id);
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
