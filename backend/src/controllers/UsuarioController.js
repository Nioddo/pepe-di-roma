const UsuarioService = require('../services/UsuarioService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Controller de Usuarios.
 * Solo traduce HTTP <-> service: lee req, delega, responde.
 */

const obtenerTodos = asyncHandler((req, res) => {
    const usuarios = UsuarioService.obtenerTodos();
    return successResponse(res, usuarios);
});

const obtenerPorId = asyncHandler((req, res) => {
    const usuario = UsuarioService.obtenerPorId(req.params.id);
    return successResponse(res, usuario);
});

const crear = asyncHandler((req, res) => {
    const usuario = UsuarioService.crear(req.body);
    return successResponse(res, usuario, 201);
});

const modificar = asyncHandler((req, res) => {
    const usuario = UsuarioService.modificar(req.params.id, req.body);
    return successResponse(res, usuario);
});

const eliminar = asyncHandler((req, res) => {
    const usuario = UsuarioService.eliminar(req.params.id);
    return successResponse(res, usuario);
});

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
