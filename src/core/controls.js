import { state } from '../state.js';

let isRotating = false;
let isRotatingBack = false;
let currentTarget = new THREE.Vector3(0, -20, -1);
let targetRotation = new THREE.Vector3(-8, -20, -9);
let initialTarget = new THREE.Vector3(0, -20, -1);

export function createOrbitControls(camera, domElement) {
  const controls = new THREE.OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI;
  controls.target.set(currentTarget.x, currentTarget.y, currentTarget.z);
  
  // Deshabilitar todos los controles del mouse para que la cámara quede fija
  controls.enabled = false;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  
  return controls;
}

export function updateCameraRotation(pointerX, pointerZ, controls) {
  const ROTATION_THRESHOLD = -10; // Umbral para activar la rotación hacia la derecha
  const BACK_ROTATION_THRESHOLD = 1; // Umbral para activar la rotación de vuelta
  

  if (state.activePointer === 'blue' && pointerX <= ROTATION_THRESHOLD && !isRotating && !isRotatingBack) {
    isRotating = true;
    isRotatingBack = false;
    if (state.pointerMesh) state.pointerMesh.visible = false;
    if (state.redPointerMesh) state.redPointerMesh.visible = false;
    startRotation(controls, targetRotation, 'toRight');
  } 
  else if (state.activePointer === 'red' && pointerZ >= BACK_ROTATION_THRESHOLD && !isRotating && !isRotatingBack) {
    isRotatingBack = true;
    isRotating = false;
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
    if (direction === 'toRight' && !isRotating) {
      return;
    }
    if (direction === 'toLeft' && !isRotatingBack) {
      return;
    }

    const currentPos = controls.target;
    const dx = targetPos.x - currentPos.x;
    const dy = targetPos.y - currentPos.y;
    const dz = targetPos.z - currentPos.z;
    
    
    // Si estamos lo suficientemente cerca del objetivo, detenemos la rotación
    if (Math.abs(dx) < epsilon && Math.abs(dy) < epsilon && Math.abs(dz) < epsilon) {
      if (direction === 'toRight') {
        isRotating = false;
        isRotatingBack = false;
        // Asegurarnos de que el puntero azul esté oculto
        if (state.pointerMesh) state.pointerMesh.visible = false;
        // Activar el puntero rojo
        if (state.redPointerMesh) {
          state.redPointerMesh.visible = true;
          state.activePointer = 'red';
        }
      } else {
        isRotatingBack = false;
        isRotating = false;
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
