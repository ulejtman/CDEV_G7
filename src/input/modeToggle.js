import { state } from '../state.js';

let hoverStartTime = null;
const HOVER_THRESHOLD = 1500; // 1.5 segundos en milisegundos
const frustumSize = 10;
const aspect = window.innerWidth / window.innerHeight;

let punteroDesactivado = false;

export function checkPointerOverBottle(pointerPosition) {
  if (!state.pointerMesh || !state.modeloBotella) return;

  const pointerPos = new THREE.Vector3(pointerPosition.x, pointerPosition.y, pointerPosition.z);
  const bottleBoundingBox = new THREE.Box3().setFromObject(state.modeloBotella);

  if (bottleBoundingBox.containsPoint(pointerPos)) {
    if (!hoverStartTime) {
      hoverStartTime = Date.now();
      console.log('Iniciando conteo sobre la botella');
    } else {
      const hoverDuration = Date.now() - hoverStartTime;
      console.log('Tiempo sobre la botella:', hoverDuration);
      if (hoverDuration >= HOVER_THRESHOLD) {
        console.log('¡Han pasado 1.5 segundos sobre la botella! Activando modo manos');
        desactivarPuntero();
        activarModoManos();
        hoverStartTime = null;
      }
    }
  } else {
    if (hoverStartTime) {
      console.log('Salió de la botella, reiniciando conteo');
      hoverStartTime = null;
    }
  }
}

function desactivarPuntero() {
  if (state.pointerMesh) {
    state.scene.remove(state.pointerMesh);
    state.pointerMesh = null;
  }
  if (state.redPointerMesh) {
    state.scene.remove(state.redPointerMesh);
    state.redPointerMesh = null;
  }
  punteroDesactivado = true;
}

function activarModoManos() {
  console.log('Activando modo manos...');
  state.modoDeteccionManos = true;
  modoManosActivado = true;
  console.log('Modo manos activado - Ahora puedes mover la botella');
}

let modoManosActivado = false;

export function updateBottleWithHands(handX, handY, isFist, handAngle) {
  if (!state.modeloBotella || !state.modoDeteccionManos || !modoManosActivado) return;

  if (isFist) {
    // Mover y rotar la botella con la mano (efecto espejo)
    state.modeloBotella.position.x = (handX - 0.5) * frustumSize * aspect;
    state.modeloBotella.position.y = -22.3 + ((0.5 - handY) * frustumSize);
    state.modeloBotella.position.z = -2.8; // Mismo Z que el vaso
    // Aplicar rotación como espejo empezando desde vertical
    state.modeloBotella.rotation.z = handAngle - Math.PI/2; // Restamos PI/2 para que comience vertical

    // Verificar si la botella está inclinada y cerca del vaso
    if (state.modeloVaso && state.liquidoMesh) {
      const distancia = Math.abs(state.modeloBotella.position.x - state.modeloVaso.position.x);
      const botellaInclinada = Math.abs(state.modeloBotella.rotation.z) > 0.1;

      if (distancia < 2.0 && botellaInclinada) {
        // Calcular nueva altura del líquido
        if (state.liquidoAltura === undefined) state.liquidoAltura = 0;
        if (state.liquidoAlturaMax === undefined) state.liquidoAlturaMax = 1.8;
        
        if (state.liquidoAltura < state.liquidoAlturaMax) {
          state.liquidoAltura += 0.01;
          // Actualizar geometría del líquido
          if (state.liquidoMesh.geometry) {
            state.liquidoMesh.scale.y = 1 + (state.liquidoAltura * 8); // Reducido de 17 a 8 para menor altura máxima
            state.liquidoMesh.position.y = -21.0 + (state.liquidoAltura * 0.3); // Reducido el factor de altura
          }
        }
        console.log('Llenando vaso - Altura:', state.liquidoAltura, 'Escala:', state.liquidoMesh.scale.y);
      }
    }
  } else {
    // Volver la botella a su posición original
    state.modeloBotella.position.x = -0.3;
    state.modeloBotella.position.y = -21.3;
    state.modeloBotella.position.z = -2.8;
    state.modeloBotella.rotation.z = 0;
  }
}

export function installModeToggle(handController, controls) {
  // Iniciar en modo detección de manos automáticamente
  state.modoDeteccionManos = true;
  handController.start();
  controls.enabled = false;
}
