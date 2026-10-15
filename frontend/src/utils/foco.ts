/** Después de validar, lleva el foco al primer campo con error para corregirlo enseguida. */
export function enfocarPrimerError(contenedor: HTMLElement | null): void {
  requestAnimationFrame(() => {
    contenedor?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
}
