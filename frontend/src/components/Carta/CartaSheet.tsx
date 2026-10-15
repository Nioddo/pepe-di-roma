import { Fragment, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import { Cottura } from './Cottura';
import { COTTURA, type CartaInfo } from '../../content/cartas';
import { formatearMonto } from '../../utils/formato';
import { idSeccion } from '../../utils/carta';
import logoCarta from '../../assets/carta/logo-carta.png';
import type { Plato, SeccionConPlatos } from '../../types';
import './CartaSheet.css';

interface CartaSheetProps {
  carta: CartaInfo;
  secciones: SeccionConPlatos[];
  /** Algo para poner al final de cada línea (en "Hacer pedido", el + / −). */
  accion?: (plato: Plato) => ReactNode;
  /** Sin logo ni pie: la versión que va dentro de "Hacer pedido". */
  compacta?: boolean;
}

/** Una línea de la carta: nombre, medida, íconos, descripción y precio en su columna. */
function CartaItem({ plato, accion }: { plato: Plato; accion?: ReactNode }) {
  return (
    <li className="carta-item" data-accion={accion ? true : undefined}>
      <div className="carta-item__texto">
        <p className="carta-item__nombre">
          {plato.nombre}
          {plato.medida && <span className="carta-item__medida"> {plato.medida}</span>}
          {plato.picante && (
            <span className="carta-item__icono" title="Picante">
              <Icon name="picante" size={18} />
              <span className="sr-only">, picante</span>
            </span>
          )}
          {plato.vegano && (
            <span className="carta-item__icono" title="Vegano">
              <Icon name="vegano" size={18} />
              <span className="sr-only">, vegano</span>
            </span>
          )}
          {plato.sinTacc && <span className="carta-item__medida"> sin TACC</span>}
        </p>
        {plato.descripcion && <p className="carta-item__desc">{plato.descripcion}</p>}
      </div>
      <span className="carta-item__signo" aria-hidden="true">
        $
      </span>
      <span className="carta-item__precio">
        <span className="sr-only">$ </span>
        {formatearMonto(plato.precio)}
      </span>
      {accion && <div className="carta-item__accion">{accion}</div>}
    </li>
  );
}

/**
 * La carta impresa, en la web: rojo sobre blanco, la letra geométrica del local,
 * secciones con su aclaración "-pastas rellenas-" y el precio con el signo alineado.
 */
export function CartaSheet({ carta, secciones, accion, compacta = false }: CartaSheetProps) {
  return (
    <article className="carta" data-carta={carta.id} data-compacta={compacta || undefined} aria-label={`Carta ${carta.nombre}`}>
      {!compacta && <img className="carta__logo" src={logoCarta} alt="Pepe Di Roma" width={537} height={299} />}

      {!compacta && carta.titulo && (
        <p className="carta__titulo">
          {carta.titulo}
          {carta.subtitulo && <span className="carta__titulo-sub"> -{carta.subtitulo}-</span>}
        </p>
      )}

      {secciones.map((s, i) => {
        const nuevoGrupo = s.grupo && s.grupo !== secciones[i - 1]?.grupo;
        const esVino = s.grupo === 'I Vini';
        return (
          <Fragment key={s.id}>
            {nuevoGrupo && <p className="carta__grupo">{s.grupo}</p>}

            <section
              id={idSeccion(carta, s)}
              className={`carta__seccion${esVino ? ' carta__seccion--sub' : ''}${nuevoGrupo ? ' carta__seccion--primera' : ''}`}
              aria-labelledby={`${idSeccion(carta, s)}-titulo`}
            >
              <h2 className="carta__seccion-titulo" id={`${idSeccion(carta, s)}-titulo`}>
                {s.titulo}
                {s.subtitulo && <span className="carta__seccion-sub"> -{s.subtitulo}-</span>}
              </h2>

              {s.platosDetalle.length > 0 ? (
                <ul className="carta__items" role="list">
                  {s.platosDetalle.map((p) => (
                    <CartaItem key={p.id} plato={p} accion={accion?.(p)} />
                  ))}
                </ul>
              ) : (
                <p className="carta__vacia">Todavía no hay platos en esta sección.</p>
              )}

              {s.nota && <p className="carta__nota">{s.nota}</p>}
            </section>

            {!compacta && carta.id === COTTURA.carta && s.titulo === COTTURA.despuesDe && <Cottura />}
          </Fragment>
        );
      })}

      {!compacta && carta.pie.length > 0 && (
        <footer className="carta__pie">
          <p className="carta__pie-lema">{carta.pie[0]}</p>
          {carta.pie.slice(1).map((linea) => (
            <p key={linea}>{linea}</p>
          ))}
        </footer>
      )}
    </article>
  );
}
