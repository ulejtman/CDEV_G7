import { state } from './state.js';

export function startAnimationLoop() {
  let selectionTimer = null; // Temporizador para la selección
  let selectedModel = null; // Modelo actualmente seleccionado

  function animate() {
    requestAnimationFrame(animate);
    if (state.controls) state.controls.update();
    state.pointerX = Math.min(Math.max(state.pointerX, 0), 1);
       state.pointerY = Math.min(Math.max(state.pointerY, 0), 1);
    // Actualizar posición del puntero
    if (state.pointerX && state.pointerY) {
      const pointerPos = new THREE.Vector3(
        (state.pointerX - 0.5) * state.frustumSize * state.aspect(),
        -21.3 + ((0.5 - state.pointerY) * state.frustumSize), // Ajustar la altura inicial
        -2 // Profundidad del puntero
      );
      state.pointerMesh.position.copy(pointerPos);
      console.log(state.selectedModel) 
    }

    // Raycasting para detectar intersección con modelos
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      { x: state.pointerX * 2 - 1, y: -(state.pointerY * 2 - 1) },
      state.camera
    );
    const objectsToIntersect = [];
    if (state.modeloBotella) objectsToIntersect.push(state.modeloBotella);
    if (state.modeloCoca) objectsToIntersect.push(state.modeloCoca);

    const intersects = raycaster.intersectObjects(objectsToIntersect, true); // Usar `true` para detectar objetos hijos 

    if (intersects.length > 0) {
      const intersectedModel = intersects[0].object; 

      // Iniciar temporizador si el puntero está sobre un modelo
      if (selectedModel !== intersectedModel) {
        selectedModel = intersectedModel;
        clearTimeout(selectionTimer);
        selectionTimer = setTimeout(() => {
          state.selectedModel = selectedModel; // Modelo seleccionado  
        }, 3000); // Esperar 3 segundos
      }
    } else {
      selectedModel = null;
      clearTimeout(selectionTimer);
    }

    // Mover/rotar el modelo seleccionado
    if (state.selectedModel && state.isFist) {
      state.selectedModel.position.x =
        (state.handX - 0.5) * state.frustumSize * state.aspect();
      state.selectedModel.position.y =
        -22.3 + ((0.5 - state.handY) * state.frustumSize);
      state.selectedModel.rotation.z = state.handAngle;

      // Servir líquido en el vaso
      if (state.modeloVaso && state.liquidoMesh) {
        const dist = Math.abs(state.selectedModel.position.x - state.modeloVaso.position.x);
        const inclinada = Math.abs(state.selectedModel.rotation.z) > 0.1;
        if (dist < 2.0 && inclinada && state.liquidoAltura < state.liquidoAlturaMax) {
          state.liquidoAltura += 0.01;
          state.liquidoMesh.scale.y = state.liquidoAltura * 10;
          state.liquidoMesh.position.y = state.modeloVaso.position.y; // nivel
        }
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
