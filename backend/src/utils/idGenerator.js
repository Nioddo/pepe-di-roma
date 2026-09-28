function createIdGenerator(desde = 1) {
    let proximoId = desde;

    return function nextId() {
        return proximoId++;
    };
}

module.exports = { createIdGenerator };
