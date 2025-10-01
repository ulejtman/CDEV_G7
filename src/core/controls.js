import { state } from '../state.js';

let isZooming = false;
let currentTarget = new THREE.Vector3(0, -20, -1);
let targetRotation = new THREE.Vector3(-8, -20, -9);
let initialTarget = new THREE.Vector3(0, -20, -1);

// Posiciones de cámara para el zoom de la mesa
const zoomMesaPosition = new THREE.Vector3(0, -19.5, -6.5); // Posición un poco más alejada
let originalCameraPosition = null; // Guardará la posición original
let originalTargetPosition = null; // Guardará el target original

export function createOrbitControls(camera, domElement) {
  const controls = new THREE.OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI;
  controls.target.set(currentTarget.x, currentTarget.y, currentTarget.z);
  
  // Agregar variables de estado de rotación a los controles
  controls.isRotating = false;
  controls.isRotatingBack = false;
  
  // Deshabilitar todos los controles del mouse para que la cámara quede fija
  controls.enabled = false;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  
  return controls;
}

export function activateZoomMesa(camera, controls) {
  if (isZooming) return;
  isZooming = true;

  // Guardar posición actual
  originalCameraPosition = camera.position.clone();
  originalTargetPosition = controls.target.clone();

  // Animación suave hacia la posición de zoom
  animateCamera(camera, controls, zoomMesaPosition, new THREE.Vector3(0, -21.3, 2), 1000);
}

export function deactivateZoomMesa(camera, controls) {
  if (!isZooming || !originalCameraPosition) return;

  // Animación suave de vuelta a la posición original
  animateCamera(camera, controls, originalCameraPosition, originalTargetPosition, 1000);
  isZooming = false;
}

function animateCamera(camera, controls, targetPosition, targetLookAt, duration) {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = Date.now();

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Función de easing para suavizar el movimiento
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    // Interpolar posición de la cámara
    camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
    controls.target.lerpVectors(startTarget, targetLookAt, easeProgress);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  update();
}

export function updateCameraRotation(pointerX, pointerZ, controls) {
  const ROTATION_THRESHOLD = -10; // Umbral para activar la rotación hacia la derecha
  const BACK_ROTATION_THRESHOLD = 1; // Umbral para activar la rotación de vuelta
  

  if (state.activePointer === 'blue' && pointerX <= ROTATION_THRESHOLD && !controls.isRotating && !controls.isRotatingBack) {
    controls.isRotating = true;
    controls.isRotatingBack = false;
    if (state.pointerMesh) state.pointerMesh.visible = false;
    if (state.redPointerMesh) state.redPointerMesh.visible = false;
    startRotation(controls, targetRotation, 'toRight');
  } 
  else if (state.activePointer === 'red' && pointerZ >= BACK_ROTATION_THRESHOLD && !controls.isRotating && !controls.isRotatingBack) {
    controls.isRotatingBack = true;
    controls.isRotating = false;
    if (state.redPointerMesh) state.redPointerMesh.visible = false;
    if (state.pointerMesh) state.pointerMesh.visible = false;
    startRotation(controls, initialTarget, 'toLeft');
  }
}

function startRotation(controls, targetPos, direction) {
  const rotationSpeed = 0.05;
  const epsilon = 0.1;

  function animate() {
    // Verificar si debemos continuar la animación basado en la dirección
    if (direction === 'toRight' && !controls.isRotating) {
      return;
    }
    if (direction === 'toLeft' && !controls.isRotatingBack) {
      return;
    }

    const currentPos = controls.target;
    const dx = targetPos.x - currentPos.x;
    const dy = targetPos.y - currentPos.y;
    const dz = targetPos.z - currentPos.z;
    
    
    // Si estamos lo suficientemente cerca del objetivo, detenemos la rotación
    if (Math.abs(dx) < epsilon && Math.abs(dy) < epsilon && Math.abs(dz) < epsilon) {
      if (direction === 'toRight') {
        controls.isRotating = false;
        controls.isRotatingBack = false;
        // Asegurarnos de que el puntero azul esté oculto
        if (state.pointerMesh) state.pointerMesh.visible = false;
        // Activar el puntero rojo
        if (state.redPointerMesh) {
          state.redPointerMesh.visible = true;
          state.activePointer = 'red';
        }
      } else {
        controls.isRotatingBack = false;
        controls.isRotating = false;
        // Asegurarnos de que el puntero rojo esté oculto
        if (state.redPointerMesh) state.redPointerMesh.visible = false;
        // Activar el puntero azul
        if (state.pointerMesh) {
          state.pointerMesh.visible = true;
          state.activePointer = 'blue';
          console.log('Rotación de regreso completada - Puntero azul activado');
        }
      }
      return;
    }

    // Interpolar suavemente hacia el objetivo
    controls.target.set(
      currentPos.x + dx * rotationSpeed,
      currentPos.y + dy * rotationSpeed,
      currentPos.z + dz * rotationSpeed
    );

    controls.update();
    requestAnimationFrame(animate);
  }

  animate();
}

export function updateRotationDirection(controls) {
  const rotationDelta = controls.getAzimuthalAngle(); // Obtener el ángulo de rotación
  if (rotationDelta > 0) {
    controls.rotationDirection = 'right'; // Rotación hacia la derecha
  } else if (rotationDelta < 0) {
    controls.rotationDirection = 'left'; // Rotación hacia la izquierda
  } else {
    controls.rotationDirection = null; // Sin rotación
  }
}
