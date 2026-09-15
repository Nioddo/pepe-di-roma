/**
 * Generador de IDs incrementales por entidad.
 * Como la persistencia es en memoria, cada repository se queda con su propia
 * secuencia y no hay riesgo de colision entre entidades distintas.
 */
function createIdGenerator(desde = 1) {
    let proximoId = desde;

    return function nextId() {
        return proximoId++;
    };
}

module.exports = { createIdGenerator };
