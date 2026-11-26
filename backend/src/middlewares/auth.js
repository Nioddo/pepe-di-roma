const UsuarioRepository = require('../repositories/UsuarioRepository');
const ReservaRepository = require('../repositories/ReservaRepository');
const PedidoRepository = require('../repositories/PedidoRepository');
const Rol = require('../enums/Rol');
const Messages = require('../enums/Messages');
const { UnauthorizedError, ForbiddenError } = require('../exceptions/AppError');

const ES_PERSONAL = [Rol.ADMIN, Rol.EMPLEADO];

function identificar(req, res, next) {
    const id = Number(req.get('x-usuario-id'));
    req.usuario = Number.isInteger(id) && id > 0 ? UsuarioRepository.findById(id) : null;
    next();
}

function requireLogin(req, res, next) {
    if (!req.usuario) {
        return next(new UnauthorizedError(Messages.AUTH_REQUERIDA));
    }
    next();
}

function requireRol(roles) {
    return function (req, res, next) {
        if (!req.usuario) {
            return next(new UnauthorizedError(Messages.AUTH_REQUERIDA));
        }
        if (!roles.includes(req.usuario.rol)) {
            return next(new ForbiddenError(Messages.AUTH_SIN_PERMISO));
        }
        next();
    };
}

const requirePersonal = requireRol(ES_PERSONAL);
const requireAdmin = requireRol([Rol.ADMIN]);

function esPersonal(usuario) {
    return Boolean(usuario) && ES_PERSONAL.includes(usuario.rol);
}

function soloPropio(buscarPorId) {
    return function (req, res, next) {
        if (esPersonal(req.usuario)) {
            return next();
        }
        const registro = buscarPorId(Number(req.params.id));
        const cambiaDuenio = req.body && req.body.clienteId !== undefined && Number(req.body.clienteId) !== req.usuario.id;
        if ((registro && registro.clienteId !== req.usuario.id) || cambiaDuenio) {
            return next(new ForbiddenError(Messages.AUTH_SIN_PERMISO));
        }
        next();
    };
}

function creaParaSiMismo(req, res, next) {
    if (!esPersonal(req.usuario) && req.body && Number(req.body.clienteId) !== req.usuario.id) {
        return next(new ForbiddenError(Messages.AUTH_SIN_PERMISO));
    }
    next();
}

const reservaPropia = [requireLogin, soloPropio((id) => ReservaRepository.findById(id))];
const pedidoPropio = [requireLogin, soloPropio((id) => PedidoRepository.findById(id))];

module.exports = {
    identificar,
    requireLogin,
    requirePersonal,
    requireAdmin,
    esPersonal,
    creaParaSiMismo,
    reservaPropia,
    pedidoPropio
};
