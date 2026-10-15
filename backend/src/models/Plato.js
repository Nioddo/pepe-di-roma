class Plato {
    constructor(id, nombre, precio, vegano, sinTacc, imageUrl, descripcion = null, medida = null, picante = false, destacado = false) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.vegano = vegano;
        this.sinTacc = sinTacc;
        this.imageUrl = imageUrl;
        this.descripcion = descripcion;
        this.medida = medida;
        this.picante = picante;
        this.destacado = destacado;
    }
}

module.exports = Plato;
