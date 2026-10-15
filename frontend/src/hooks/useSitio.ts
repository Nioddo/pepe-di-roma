import { useMemo } from 'react';
import { useContenido } from '../context/ContenidoContext';
import { CARTA_IDS, COTTURA_CONSEJOS, COTTURA_FORMAS, type CartaInfo } from '../content/cartas';
import { resolverImagen } from '../utils/imagenes';
import type { CartaId } from '../types';

/** Las tres cartas con los nombres y textos que cargó el admin. */
export function useCartas() {
  const { texto, lineas } = useContenido();

  return useMemo(() => {
    const cartas: CartaInfo[] = CARTA_IDS.map((id) => ({
      id,
      nombre: texto(`carta.${id}.nombre`) || id,
      titulo: texto(`carta.${id}.titulo`) || null,
      subtitulo: texto(`carta.${id}.subtitulo`) || null,
      uso: texto(`carta.${id}.uso`),
      pie: lineas(`carta.${id}.pie`)
    }));
    const cartaInfo = (id: CartaId) => cartas.find((c) => c.id === id) ?? cartas[0];
    return { cartas, cartaInfo };
  }, [texto, lineas]);
}

/** Datos de contacto y horario del local. */
export function useContacto() {
  const { texto } = useContenido();
  const telefono = texto('contacto.telefono');
  return {
    direccion: texto('contacto.direccion'),
    barrio: texto('contacto.barrio'),
    telefono,
    telefonoHref: `tel:${telefono.replace(/[^\d+]/g, '')}`,
    whatsappHref: `https://wa.me/${texto('contacto.whatsapp')}`,
    email: texto('contacto.email'),
    instagram: texto('contacto.instagram'),
    instagramUrl: texto('contacto.instagramUrl'),
    pedidosya: texto('contacto.pedidosya'),
    dias: texto('contacto.dias'),
    horario: texto('contacto.horario'),
    horarioExtendido: texto('contacto.horarioExtendido')
  };
}

/** Dónde está el local: dirección, mapa de Google y enlace para llegar. */
export function useUbicacion() {
  const { texto } = useContenido();
  const consulta = encodeURIComponent(texto('ubicacion.mapa') || `${texto('contacto.direccion')}, ${texto('contacto.barrio')}`);
  return {
    titulo: texto('ubicacion.titulo'),
    bajada: texto('ubicacion.bajada'),
    boton: texto('ubicacion.boton'),
    accesibilidad: texto('ubicacion.accesibilidad'),
    mapa: `https://www.google.com/maps?q=${consulta}&output=embed`,
    comoLlegar: `https://www.google.com/maps/dir/?api=1&destination=${consulta}`
  };
}

/** Una foto del sitio: la clave guarda una foto del catálogo o una URL. */
export function useFoto(clave: string) {
  const { texto } = useContenido();
  return { src: resolverImagen(texto(clave)), alt: texto(`${clave}Alt`) || texto(`${clave}.alt`) };
}

/** Las fotos del carrusel "Sobre nosotros" que tengan imagen cargada. */
export function useFotosLocal() {
  const { texto } = useContenido();
  return [1, 2, 3, 4, 5, 6]
    .map((n) => ({
      src: resolverImagen(texto(`nosotros.foto${n}`)),
      alt: texto(`nosotros.foto${n}.alt`),
      texto: texto(`nosotros.foto${n}.texto`)
    }))
    .filter((f): f is { src: string; alt: string; texto: string } => f.src !== null);
}

/** "Tempo di cottura": siluetas fijas, tiempos y consejos editables. */
export function useCottura() {
  const { texto, lineas } = useContenido();
  return {
    titulo: texto('cottura.titulo'),
    seccion: texto('cottura.seccion'),
    formas: COTTURA_FORMAS.map((f) => ({ ...f, tiempo: texto(`cottura.${f.clave}`) })),
    consejos: COTTURA_CONSEJOS.map((c) => ({ clave: c, titulo: texto(`cottura.${c}.titulo`), texto: lineas(`cottura.${c}`) })).filter(
      (c) => c.titulo || c.texto.length
    )
  };
}
