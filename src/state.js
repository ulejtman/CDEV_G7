// Objetos y banderas compartidas entre módulos
export const state = {
  scene: null,
  renderer: null,
  camera: null,
  controls: null,

  modeloMesa: null,
  modeloBotella: null,
  modeloVaso: null,
  modeloCoca: null,
  liquidoMesh: null,
  liquidoAltura: 0,
  liquidoAlturaMax: 1.8,

  // Interacción manos
  modoDeteccionManos: false,
  handX: 0,
  handY: 0,
  pointerX: 0,
  pointerY: 0,
  isFist: false,
  handAngle: 0,
  selectedModel: null, // Modelo seleccionado

  // Constantes de movimiento
  frustumSize: 10,
  aspect: () => window.innerWidth / window.innerHeight,
};
