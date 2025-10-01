import { state } from '../state.js';

export function createPointer() {
  // Crear la geometría y el material del puntero azul
  const pointerGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  const bluePointerMaterial = new THREE.MeshBasicMaterial({ color: 'blue' });
  const redPointerMaterial = new THREE.MeshBasicMaterial({ color: 'red' });

  // Crear el mesh del puntero azul
  const bluePointerMesh = new THREE.Mesh(pointerGeometry, bluePointerMaterial);
  bluePointerMesh.position.set(0, -18, -2.8);
  state.scene.add(bluePointerMesh);
  state.pointerMesh = bluePointerMesh;

  // Crear el mesh del puntero rojo (inicialmente invisible)
  const redPointerMesh = new THREE.Mesh(pointerGeometry, redPointerMaterial);
  redPointerMesh.position.set(-6.2, -18, -9); // Posición inicial solicitada
  redPointerMesh.visible = false;
  state.scene.add(redPointerMesh);
  state.redPointerMesh = redPointerMesh;

  // Agregar estado para controlar qué puntero está activo
  state.activePointer = 'blue';
}