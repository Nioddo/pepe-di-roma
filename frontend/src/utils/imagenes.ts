// Catálogo de fotos reales de la marca (src/assets/platos).
// En la API, cada plato guarda en imageUrl la clave "platos/<archivo>.jpg";
// acá se traduce a la URL final que genera Vite.

const archivos = import.meta.glob<string>('../assets/platos/*.jpg', {
  eager: true,
  import: 'default'
});

export interface FotoCatalogo {
  clave: string;
  url: string;
  nombre: string;
}

function nombreLegible(archivo: string): string {
  const base = archivo.replace(/^pepediroma_\d+_/, '').replace(/\.jpg$/, '').replace(/_/g, ' ');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export const catalogoFotos: FotoCatalogo[] = Object.entries(archivos)
  .map(([ruta, url]) => {
    const archivo = ruta.split('/').pop() ?? ruta;
    return { clave: `platos/${archivo}`, url, nombre: nombreLegible(archivo) };
  })
  .sort((a, b) => a.clave.localeCompare(b.clave));

const porClave = new Map(catalogoFotos.map((f) => [f.clave, f.url]));

/** Devuelve una URL que se puede mostrar, o null si la imagen no existe. */
export function resolverImagen(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const clave = imageUrl.replace(/^\/+/, '');
  const local = porClave.get(clave);
  if (local) return local;
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  return null;
}
