import React from 'react';

// Resaltado de sintaxis simple con los colores de VS Code Dark+.
const COL = {
  comentario: '#6a9955',
  texto: '#ce9178',
  numero: '#b5cea8',
  clave: '#569cd6',
  control: '#c586c0',
  funcion: '#dcdcaa',
  tipo: '#4ec9b0',
  variable: '#9cdcfe',
  base: '#d4d4d4'
};

const CONTROL = new Set(['return', 'if', 'else', 'for', 'of', 'in', 'throw', 'try', 'catch', 'await', 'import', 'export', 'from', 'default', 'while', 'switch', 'case', 'break', 'continue']);
const CLAVE = new Set(['const', 'let', 'var', 'function', 'new', 'async', 'class', 'extends', 'typeof', 'null', 'undefined', 'true', 'false', 'this', 'type', 'interface', 'void', 'as', 'static']);

const RE = /(\/\/.*$|\/\*.*?\*\/|^\s*\*.*$|^\s*\/\*.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)/g;

export function resaltar(linea: string): React.ReactNode[] {
  const partes: React.ReactNode[] = [];
  let ultimo = 0;
  let m: RegExpExecArray | null;
  RE.lastIndex = 0;
  let k = 0;
  while ((m = RE.exec(linea))) {
    if (m.index > ultimo) partes.push(linea.slice(ultimo, m.index));
    const [txt, com, str, num, id] = m;
    let color = COL.base;
    if (com) color = COL.comentario;
    else if (str) color = COL.texto;
    else if (num) color = COL.numero;
    else if (id) {
      const resto = linea.slice(m.index + txt.length);
      if (CONTROL.has(id)) color = COL.control;
      else if (CLAVE.has(id)) color = COL.clave;
      else if (/^\s*\(/.test(resto) || /^\s*=\s*(async\s*)?\(/.test(resto)) color = COL.funcion;
      else if (/^[A-Z]/.test(id)) color = /^[A-Z0-9_]+$/.test(id) && id.length > 1 ? COL.variable : COL.tipo;
      else color = COL.variable;
    }
    partes.push(
      <span key={k++} style={{ color, fontStyle: com ? 'italic' : undefined }}>
        {txt}
      </span>
    );
    ultimo = m.index + txt.length;
    if (txt.length === 0) RE.lastIndex++;
  }
  if (ultimo < linea.length) partes.push(linea.slice(ultimo));
  return partes;
}
