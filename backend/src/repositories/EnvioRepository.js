const Envio = require('../models/Envio');
const { createIdGenerator } = require('../utils/idGenerator');

// el registro de lo que se mandó: asunto, cuándo y a cuántas personas llegó
const envios = [];

const nextId = createIdGenerator(1);

function findAll() {
    return envios;
}

function create(datos) {
    const envio = new Envio(nextId(), datos.asunto, datos.fecha, datos.enviados, datos.fallidos);

    envios.push(envio);
    return envio;
}

module.exports = {
    findAll,
    create
};
