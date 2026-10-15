// Cómo se presenta cada clave de /api/contenido en "Textos y fotos".
// Una clave que no esté acá igual se puede editar: cae en el grupo "Otros".

export type TipoCampo = 'texto' | 'largo' | 'foto';

export interface Campo {
  clave: string;
  label: string;
  tipo?: TipoCampo;
  ayuda?: string;
}

export interface Grupo {
  id: string;
  titulo: string;
  bajada: string;
  campos: Campo[];
}

const UNA_POR_LINEA = 'Una línea por renglón.';

const carta = (id: string, nombre: string): Campo[] => [
  { clave: `carta.${id}.nombre`, label: `${nombre}: nombre en pestañas y portada` },
  { clave: `carta.${id}.uso`, label: `${nombre}: para qué sirve (una línea)` },
  { clave: `carta.${id}.titulo`, label: `${nombre}: título de la hoja`, ayuda: 'Vacío si la hoja no lleva título.' },
  { clave: `carta.${id}.subtitulo`, label: `${nombre}: aclaración del título` },
  { clave: `carta.${id}.pie`, label: `${nombre}: pie de la hoja`, tipo: 'largo', ayuda: `${UNA_POR_LINEA} La primera va como lema.` }
];

const foto = (n: number): Campo[] => [
  { clave: `nosotros.foto${n}`, label: `Foto ${n}`, tipo: 'foto' },
  { clave: `nosotros.foto${n}.alt`, label: `Foto ${n}: descripción para lectores de pantalla` },
  { clave: `nosotros.foto${n}.texto`, label: `Foto ${n}: epígrafe` }
];

const FORMAS = [
  'anolini', 'radiatori', 'cappelacci', 'maccheroni', 'agnolotti', 'tortelli', 'mafaldine', 'casoncelli',
  'spaghetti', 'mezze-maniche', 'caramelle', 'gnocchi', 'tortelloni', 'cappelletti', 'fusilli'
];

const CONSEJOS: [string, string][] = [
  ['istruzioni', 'Instrucciones'],
  ['comeTiPiace', 'Punto de cocción'],
  ['conservazione', 'Conservación'],
  ['freezer', 'Freezer'],
  ['porzione', 'Porción']
];

const nombreForma = (clave: string) => clave.charAt(0).toUpperCase() + clave.slice(1).replace('-', ' ');

export const GRUPOS: Grupo[] = [
  {
    id: 'portada',
    titulo: 'Portada',
    bajada: 'Lo primero que se ve al entrar: el título grande, la bajada y la foto en arco.',
    campos: [
      { clave: 'portada.titulo', label: 'Título', tipo: 'largo', ayuda: 'Cada renglón va en una línea. Corto: dos renglones como mucho.' },
      { clave: 'portada.bajada', label: 'Bajada', tipo: 'largo' },
      { clave: 'portada.foto', label: 'Foto', tipo: 'foto' },
      { clave: 'portada.fotoAlt', label: 'Descripción de la foto (lectores de pantalla)' },
      { clave: 'estrella.titulo', label: 'Título de "Productos estrella"', ayuda: 'Qué platos salen se elige en Carta, con la etiqueta Estrella.' },
      { clave: 'estrella.boton', label: 'Botón de "Productos estrella"' }
    ]
  },
  {
    id: 'cartas',
    titulo: 'Cartas',
    bajada: 'Los nombres de las tres cartas, sus títulos impresos y los pies de página.',
    campos: [
      { clave: 'cartas.titulo', label: 'Título de la sección en la portada' },
      { clave: 'cartas.bajada', label: 'Bajada de la sección en la portada' },
      ...carta('RISTORANTE', 'Restaurante'),
      ...carta('PER_PORTARE_VIA', 'Para llevar'),
      ...carta('COLAZIONE', 'Desayuno y merienda')
    ]
  },
  {
    id: 'opiniones',
    titulo: 'Opiniones y encuesta',
    bajada: 'Los textos de "Nuestras calificaciones" y de la encuesta que completan los clientes.',
    campos: [
      { clave: 'opiniones.titulo', label: 'Título en la portada' },
      { clave: 'opiniones.bajada', label: 'Bajada en la portada' },
      { clave: 'opiniones.boton', label: 'Botón para opinar' },
      { clave: 'opiniones.google', label: 'Calificación en Google', ayuda: 'El dato público, con su fecha. Vacío para no mostrarlo.' },
      { clave: 'opiniones.googleUrl', label: 'Enlace a la ficha de Google Maps' },
      { clave: 'encuesta.titulo', label: 'Título de la encuesta' },
      { clave: 'encuesta.bajada', label: 'Bajada de la encuesta', tipo: 'largo' },
      { clave: 'encuesta.gracias', label: 'Mensaje de agradecimiento' }
    ]
  },
  {
    id: 'nosotros',
    titulo: 'Sobre nosotros',
    bajada: 'El bloque rojo de la portada y su carrusel de fotos del local.',
    campos: [
      { clave: 'nosotros.titulo', label: 'Título' },
      { clave: 'nosotros.bajada', label: 'Frase destacada' },
      { clave: 'nosotros.texto', label: 'Texto', tipo: 'largo' },
      { clave: 'nosotros.boton', label: 'Botón' },
      ...foto(1),
      ...foto(2),
      ...foto(3),
      ...foto(4),
      ...foto(5),
      ...foto(6)
    ]
  },
  {
    id: 'rituales',
    titulo: 'Lo que pasa en Pepe',
    bajada: 'Las costumbres de la casa en la portada: cuándo pasa cada cosa, qué es y su foto.',
    campos: [
      { clave: 'rituales.titulo', label: 'Título' },
      { clave: 'rituales.bajada', label: 'Bajada' },
      ...[1, 2, 3, 4].flatMap((n): Campo[] => [
        { clave: `rituales.${n}.cuando`, label: `Costumbre ${n}: cuándo` },
        { clave: `rituales.${n}.titulo`, label: `Costumbre ${n}: nombre` },
        { clave: `rituales.${n}.texto`, label: `Costumbre ${n}: texto`, tipo: 'largo' },
        { clave: `rituales.${n}.foto`, label: `Costumbre ${n}: foto`, tipo: 'foto' },
        { clave: `rituales.${n}.fotoAlt`, label: `Costumbre ${n}: descripción de la foto` }
      ])
    ]
  },
  {
    id: 'ubicacion',
    titulo: 'Dónde estamos',
    bajada: 'El bloque con el mapa de Google y la foto de la puerta. La dirección se cambia en Contacto.',
    campos: [
      { clave: 'ubicacion.titulo', label: 'Título' },
      { clave: 'ubicacion.bajada', label: 'Bajada', tipo: 'largo' },
      { clave: 'ubicacion.mapa', label: 'Qué buscar en Google Maps', ayuda: 'El nombre del local y la dirección completa, como se buscaría en Google Maps.' },
      { clave: 'ubicacion.boton', label: 'Botón para llegar' },
      { clave: 'ubicacion.accesibilidad', label: 'Accesibilidad y estacionamiento' },
      { clave: 'ubicacion.foto', label: 'Foto del local', tipo: 'foto' },
      { clave: 'ubicacion.fotoAlt', label: 'Descripción de la foto (lectores de pantalla)' }
    ]
  },
  {
    id: 'reservar',
    titulo: 'Reservas',
    bajada: 'La banda "Reservar" del final de la portada y la bajada de la pantalla de reservas.',
    campos: [
      { clave: 'reservar.palabra', label: 'Palabra grande de la banda' },
      { clave: 'reservar.nota', label: 'Nota de la banda', tipo: 'largo' },
      { clave: 'reservar.bajada', label: 'Bajada de la pantalla Reservar', tipo: 'largo' }
    ]
  },
  {
    id: 'cuentas',
    titulo: 'Ingresar y registrarse',
    bajada: 'Las fotos que acompañan los formularios de cuenta.',
    campos: [
      { clave: 'ingresar.foto', label: 'Foto de Ingresar', tipo: 'foto' },
      { clave: 'ingresar.fotoAlt', label: 'Descripción de la foto de Ingresar' },
      { clave: 'registrarse.foto', label: 'Foto de Registrarse', tipo: 'foto' },
      { clave: 'registrarse.fotoAlt', label: 'Descripción de la foto de Registrarse' }
    ]
  },
  {
    id: 'contacto',
    titulo: 'Contacto y pie de página',
    bajada: 'Los datos del local que aparecen en el pie de todas las pantallas.',
    campos: [
      { clave: 'contacto.direccion', label: 'Dirección' },
      { clave: 'contacto.barrio', label: 'Barrio' },
      { clave: 'contacto.telefono', label: 'Teléfono / WhatsApp (como se muestra)' },
      { clave: 'contacto.whatsapp', label: 'Número de WhatsApp para el enlace', ayuda: 'Solo números, con código de país: 5491161138175.' },
      { clave: 'contacto.email', label: 'Email', ayuda: 'Vacío para no mostrarlo.' },
      { clave: 'contacto.instagram', label: 'Instagram (usuario)' },
      { clave: 'contacto.instagramUrl', label: 'Instagram (enlace)' },
      { clave: 'contacto.pedidosya', label: 'Enlace a PedidosYa', ayuda: 'Vacío para no mostrarlo.' },
      { clave: 'contacto.dias', label: 'Días de atención' },
      { clave: 'contacto.horario', label: 'Horario' },
      { clave: 'contacto.horarioExtendido', label: 'Horario extendido', ayuda: 'Por ejemplo, los días que cierran más tarde.' },
      { clave: 'sitio.lema', label: 'Lema' },
      { clave: 'footer.texto', label: 'Texto del pie', tipo: 'largo' },
      { clave: 'salon.cocina', label: 'Texto de la barra en el plano del salón', ayuda: 'Vacío para no mostrar la barra.' }
    ]
  },
  {
    id: 'cottura',
    titulo: 'Tempo di cottura',
    bajada: 'El cuadro de cocción de la carta para llevar: tiempos de cada pasta y consejos.',
    campos: [
      { clave: 'cottura.titulo', label: 'Título del cuadro' },
      { clave: 'cottura.seccion', label: 'Va después de la sección', ayuda: 'El título exacto de una sección de la carta para llevar.' },
      ...FORMAS.map((f) => ({ clave: `cottura.${f}`, label: `${nombreForma(f)}: tiempo`, ayuda: 'Vacío para no mostrarla.' })),
      ...CONSEJOS.flatMap(([c, nombre]): Campo[] => [
        { clave: `cottura.${c}.titulo`, label: `${nombre}: título` },
        { clave: `cottura.${c}`, label: `${nombre}: texto`, tipo: 'largo', ayuda: UNA_POR_LINEA }
      ])
    ]
  }
];

/** Claves que se editan en otra pantalla (el tamaño del plano está en Salón). */
export const CLAVES_EN_OTRA_PANTALLA = new Set(['salon.columnas', 'salon.filas']);
