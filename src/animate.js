import { state } from './state.js';
import { updateCameraRotation } from './core/controls.js';
import { updateBottleWithHands } from './input/modeToggle.js';
import { checkPointerOverBottle } from './input/modeToggle.js';

export function startAnimationLoop() {
  let selectionTimer = null; // Temporizador para la selección
  let selectedModel = null; // Modelo actualmente seleccionado

  function animate() {
    requestAnimationFrame(animate);
    if (state.controls) state.controls.update();
    state.pointerX = Math.min(Math.max(state.pointerX, 0), 1);
    state.pointerY = Math.min(Math.max(state.pointerY, 0), 1);

    // Actualizar la botella con el tracking de manos
    if (state.modoDeteccionManos) {
      updateBottleWithHands(state.handX, state.handY, state.isFist, state.handAngle);
    }

    // Establecer el puntero activo basado en la rotación de la cámara (si no está rotando)
    if (state.controls && !state.controls.isRotating && !state.controls.isRotatingBack) {
      const isRotated = Math.abs(state.controls.target.x - (-8)) < 0.5 && 
                       Math.abs(state.controls.target.z - (-9)) < 0.5;
      state.activePointer = isRotated ? 'red' : 'blue';
    }

    // Actualizar posición del puntero
    if (state.pointerX && state.pointerY) {
      // Calcular la posición del puntero independientemente de si existe o no
      const pointerPos = new THREE.Vector3(
        (state.pointerX - 0.5) * state.frustumSize * state.aspect(),
        -21.3 + ((0.5 - state.pointerY) * state.frustumSize),
        -2.8
      );

      if (state.activePointer === 'blue' && state.pointerMesh) {
        // Movimiento del puntero azul (original)
        state.pointerMesh.position.copy(pointerPos);
        if (!state.controls.isRotating && !state.controls.isRotatingBack) {
          state.pointerMesh.visible = true;
          if (state.redPointerMesh) state.redPointerMesh.visible = false;
        }
        
        // Verificar la posición del puntero para la rotación de la cámara
        updateCameraRotation(pointerPos.x, pointerPos.z, state.controls);
        // Verificar si el puntero está sobre la botella
        checkPointerOverBottle(pointerPos);
      } else if (state.activePointer === 'red' && state.redPointerMesh) {
        // Movimiento del puntero rojo (ejes Z e Y, X fijo)
        const redPointerPos = new THREE.Vector3(
          -6.2, // X fijo
          -18 + ((0.5 - state.pointerY) * state.frustumSize), // Y se mueve con el mouse
          -9 + ((state.pointerX - 0.5) * state.frustumSize * state.aspect()) // Z se mueve con el mouse
        );
        state.redPointerMesh.position.copy(redPointerPos);
        if (!state.controls.isRotating && !state.controls.isRotatingBack) {
          state.redPointerMesh.visible = true;
          if (state.pointerMesh) state.pointerMesh.visible = false;
        }
        
        // Verificar la posición del puntero rojo para la rotación de la cámara
        updateCameraRotation(redPointerPos.x, redPointerPos.z, state.controls);
      }
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
