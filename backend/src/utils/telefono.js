function telefonoValido(telefono) {
    if (typeof telefono !== 'string') {
        return false;
    }
    const digitos = telefono.replace(/[\s()+-]/g, '');
    return /^\d{8,15}$/.test(digitos);
}

module.exports = { telefonoValido };
