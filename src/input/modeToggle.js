import { state } from '../state.js';

export function installModeToggle(handController, controls) {
  // Iniciar en modo detección de manos automáticamente
  state.modoDeteccionManos = true;
  handController.start();
  controls.enabled = false;

  // Mantener la funcionalidad del toggle por si se necesita cambiar el modo
  function onKey(e) {
    if (e.code === 'Space') {
      state.modoDeteccionManos = !state.modoDeteccionManos;
      if (state.modoDeteccionManos) {
        handController.start();
        controls.enabled = false;
      } else {
        handController.stop();
        controls.enabled = true;
      }
    }
  }
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}
