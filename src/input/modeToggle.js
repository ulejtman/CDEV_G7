import { state } from '../state.js';

export function installModeToggle(handController, controls) {
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
