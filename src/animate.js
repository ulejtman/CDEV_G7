import { state } from './state.js';

export function startAnimationLoop() {
  function animate() {
    requestAnimationFrame(animate);
    if (state.controls) state.controls.update();

    if (state.modeloBotella && state.modoDeteccionManos) {
      if (state.isFist) {
        // mover/rotar botella
        state.modeloBotella.position.x =
          (state.handX - 0.5) * state.frustumSize * state.aspect();
        state.modeloBotella.position.y =
          -22.3 + ((0.5 - state.handY) * state.frustumSize);
        state.modeloBotella.rotation.z = state.handAngle;

        // “servir” en el vaso
        if (state.modeloVaso && state.liquidoMesh) {
          const dist = Math.abs(state.modeloBotella.position.x - state.modeloVaso.position.x);
          const inclinada = Math.abs(state.modeloBotella.rotation.z) > 0.1;
          if (dist < 2.0 && inclinada && state.liquidoAltura < state.liquidoAlturaMax) {
            state.liquidoAltura += 0.01;
            state.liquidoMesh.scale.y = state.liquidoAltura * 10;
            state.liquidoMesh.position.y = state.modeloVaso.position.y; // nivel
          }
        }
      } else {
        // volver a reposo
        state.modeloBotella.position.set(0, -21.3, state.modeloBotella.position.z);
        state.modeloBotella.rotation.z = 0;
      }
    }

    state.renderer.render(state.scene, state.camera);
  }
  animate();

  // resize
  window.addEventListener('resize', () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
