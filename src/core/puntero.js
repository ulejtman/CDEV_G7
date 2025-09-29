import { state } from '../state.js';

export function createPointer() {
  // Crear la geometría y el material del puntero
  const pointerGeometry = new THREE.SphereGeometry(0.2, 32, 32); // Esfera pequeña
  const pointerMaterial = new THREE.MeshBasicMaterial({ color: 'blue' }); // Color azul

  // Crear el mesh del puntero
  const pointerMesh = new THREE.Mesh(pointerGeometry, pointerMaterial);

  // Configurar la posición inicial del puntero (misma altura que la botella y la coca)
  pointerMesh.position.set(0, -21.3, -2.8); // Ajustar posición inicial (X, Y, Z)

  // Agregar el puntero a la escena
  state.scene.add(pointerMesh);

  // Guardar el puntero en el estado global
  state.pointerMesh = pointerMesh;
}