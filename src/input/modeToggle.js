import { state } from '../state.js';
import { createPointer } from '../core/puntero.js';

let hoverStartTime = null;
const HOVER_THRESHOLD = 1500; // 1.5 segundos en milisegundos
const frustumSize = 10;
const aspect = window.innerWidth / window.innerHeight;

let punteroDesactivado = false;
let modoManosActivado = false;
let checkingInactivity = false;
let ultimoTiempoAgarreBotella = Date.now();

export async function checkPointerOverBottle(pointerPosition) {
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
  ultimoTiempoAgarreBotella = Date.now(); // Inicializar el tiempo de agarre
}

async function activarModoManos() {
  console.log('Iniciando secuencia de activación...');
  checkingInactivity = false; // Reiniciar el flag de verificación
  ultimoTiempoAgarreBotella = Date.now(); // Inicializar el tiempo de agarre
  
  // Activar el zoom primero
  if (state.camera && state.controls) {
    const { activateZoomMesa } = await import('../core/controls.js');
    activateZoomMesa(state.camera, state.controls);
    
    // Esperar a que termine la animación del zoom (1 segundo)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Activar modo manos
  console.log('Activando modo manos...');
  state.modoDeteccionManos = true;
  modoManosActivado = true;
  console.log('Modo manos activado - Ahora puedes mover la botella');
}

// Ya declaradas arriba

async function volverModoPuntero() {
  console.log('Volviendo a modo puntero...');
  
  // Desactivar zoom primero
  if (state.camera && state.controls) {
    const { deactivateZoomMesa } = await import('../core/controls.js');
    deactivateZoomMesa(state.camera, state.controls);
    
    // Esperar a que termine la animación del zoom
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Restablecer el modo puntero y reiniciar el hand tracking
  if (state.handController) {
    await state.handController.stop();
    await state.handController.start();
  }
  
  state.modoDeteccionManos = true; // Mantener la detección de manos activa
  modoManosActivado = false;
  punteroDesactivado = false;
  ultimoTiempoAgarreBotella = null;
  checkingInactivity = false;
  
  // Asegurarnos de que no queden punteros antiguos
  if (state.pointerMesh) {
    state.scene.remove(state.pointerMesh);
    state.pointerMesh = null;
  }
  if (state.redPointerMesh) {
    state.scene.remove(state.redPointerMesh);
    state.redPointerMesh = null;
  }

  // Recrear los punteros y configurar su visibilidad inicial
  const { createPointer } = await import('../core/puntero.js');
  createPointer();
  
  // Restablecer el modo y controles de la cámara
  state.modo = 'servir';
  
  // Configurar los controles de la cámara correctamente
  if (state.controls) {
    const controls = state.controls;
    
    // Deshabilitar controles directos del usuario
    controls.enabled = false;
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;
  }
  
  console.log('Modo puntero activado');
}

function checkInactivity() {
  if (!modoManosActivado || !ultimoTiempoAgarreBotella || checkingInactivity) return;

  const tiempoInactivo = Date.now() - ultimoTiempoAgarreBotella;
  const segundosRestantes = 5 - Math.floor(tiempoInactivo / 1000);
  if (segundosRestantes > 0) {
    console.log(`Volviendo al modo puntero en: ${segundosRestantes} segundos`);
  }

  if (tiempoInactivo >= 5000) { // 5 segundos
    checkingInactivity = true; // Evitar múltiples activaciones
    volverModoPuntero();
  }
}

// Iniciar el intervalo de verificación
setInterval(checkInactivity, 1000); // Verificar cada segundo

export function updateBottleWithHands(handX, handY, isFist, handAngle) {
  if (!state.modeloBotella || !state.modoDeteccionManos || !modoManosActivado) return;

  if (isFist) {
    // Solo actualizar el tiempo cuando realmente está agarrando y moviendo la botella
    if (Math.abs(state.modeloBotella.position.x - ((handX - 0.5) * frustumSize * aspect)) > 0.01 ||
        Math.abs(state.modeloBotella.position.y - (-22.3 + ((0.5 - handY) * frustumSize))) > 0.01 ||
        Math.abs(state.modeloBotella.rotation.z - (handAngle - Math.PI/2)) > 0.01) {
      ultimoTiempoAgarreBotella = Date.now();
    }
    
    // Mover y rotar la botella con la mano (efecto espejo)
    state.modeloBotella.position.x = (handX - 0.5) * frustumSize * aspect;
    state.modeloBotella.position.y = -22.3 + ((0.5 - handY) * frustumSize);
    state.modeloBotella.position.z = -2.5; // Mantener posición Z fija
    // Aplicar rotación como espejo empezando desde vertical
    state.modeloBotella.rotation.z = handAngle - Math.PI/2; // Restamos PI/2 para que comience vertical

    // Función para obtener la posición del pico de la botella
    function getPicoBotellaPos() {
      if (!state.modeloBotella) return null;
      
      // Inicializar el pico con valores muy bajos
      let pico = new THREE.Vector3(0, -Infinity, 0);
      let found = false;

      // Asegurarse de que las matrices mundiales estén actualizadas
      state.modeloBotella.updateMatrixWorld(true);
      
      state.modeloBotella.traverse((child) => {
        if (child.isMesh) {
          // Calcular la caja delimitadora si no existe
          if (!child.geometry.boundingBox) {
            child.geometry.computeBoundingBox();
          }
          const box = child.geometry.boundingBox;
          
          // Crear el punto en coordenadas locales
          const localPico = new THREE.Vector3(
            (box.max.x + box.min.x) / 2,
            box.max.y,
            (box.max.z + box.min.z) / 2
          );

          // Crear una matriz mundial para este mesh
          const worldMatrix = child.matrixWorld;
          
          // Convertir el punto a coordenadas mundiales
          const worldPico = localPico.clone().applyMatrix4(worldMatrix);
          
          // Actualizar el pico si este punto es más alto
          if (worldPico.y > pico.y) {
            pico.copy(worldPico);
            found = true;
          }
        }
      });
      
      return found ? pico : null;
    }

    // Verificar si la botella está inclinada y el pico toca la zona de llenado
    if (state.modeloVaso && state.liquidoMesh) {
      const picoBotella = getPicoBotellaPos();
      if (!picoBotella) return;

      // Verificar si el pico está en la zona de llenado (solo considera X e Y)
      const enRangoX = picoBotella.x >= 0.5 && picoBotella.x <= 1.5;
      const enRangoY = picoBotella.y >= -20.6 && picoBotella.y <= -20.0; // Rango centrado alrededor de -20.3
      const botellaInclinada = Math.abs(state.modeloBotella.rotation.z) > 0.3;
      
      // Verificar condiciones de llenado

      if (enRangoX && enRangoY && botellaInclinada) { // Reducida la distancia horizontal requerida
        // Calcular nueva altura del líquido
        if (state.liquidoAltura === undefined) state.liquidoAltura = 0;
        if (state.liquidoAlturaMax === undefined) state.liquidoAlturaMax = 1.8;
        
        if (state.liquidoAltura < state.liquidoAlturaMax) {
          state.liquidoAltura += 0.01; // Velocidad original
          // Actualizar geometría del líquido
          if (state.liquidoMesh) {
            state.liquidoMesh.scale.y = state.liquidoAltura * 17; // Usar escala original
            state.liquidoMesh.position.y = 0.3; // Mantener posición Y fija como en el original
          }
          // Reproducir sonido del vino si existe y no está sonando
          if (state.sonidoVino && !state.sonidoVino.isPlaying) {
            state.sonidoVino.play();
          }
        } else {
          // Si no estamos llenando (porque está lleno), detener el sonido
          if (state.sonidoVino && state.sonidoVino.isPlaying) {
            state.sonidoVino.stop();
          }
        }
        console.log('Llenando vaso - Altura:', state.liquidoAltura, 'Escala:', state.liquidoMesh.scale.y);
      } else {
        // Si no estamos en posición de llenado, detener el sonido
        if (state.sonidoVino && state.sonidoVino.isPlaying) {
          state.sonidoVino.stop();
        }
      }
    }
  } else {
    // Volver la botella a su posición original
    state.modeloBotella.position.x = -0.3;
    state.modeloBotella.position.y = -21.3;
    state.modeloBotella.position.z = -2.5; // Posición Z fija para mejor interacción con el vaso
    state.modeloBotella.rotation.z = 0;

    // El líquido mantendrá su estado actual ya que es parte del vaso
  }
}

export function installModeToggle(handController, controls) {
  // Iniciar en modo detección de manos automáticamente
  state.modoDeteccionManos = true;
  handController.start();
  controls.enabled = false;
}
