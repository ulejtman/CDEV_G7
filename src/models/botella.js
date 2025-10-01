import { GLTFLoader } from '../../libs/GLTFLoader.js';
import { state } from '../state.js';

export function loadBotella() {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load('assets/models/fernet/scene.gltf', (gltf) => {
      gltf.scene.position.x = -0.3;
      gltf.scene.position.y = -21.3; // Sobre la mesa
      gltf.scene.position.z = -2.6;
      gltf.scene.rotation.y = Math.PI;
      gltf.scene.scale.set(20, 20, 20);
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.needsUpdate = true;
        }
      });

      state.scene.add(gltf.scene); // Agregar la botella a la escena
      state.modeloBotella = gltf.scene; // Asignar el modelo de la botella al estado
      resolve(gltf.scene); // Resolver la promesa con el modelo cargado
    }, undefined, (error) => {
      console.error('Error al cargar el modelo de la botella:', error);
      reject(error); // Rechazar la promesa en caso de error
    });
  });
}


// Función para obtener la posición del pico de la botella
export function getPicoBotellaPos() {
  if (!modeloBotella) return null;
  // Encuentra el punto más alto en Y de la botella
  let pico = new THREE.Vector3();
  state.modeloBotella.updateMatrixWorld();
  state.modeloBotella.traverse((child) => {
    if (child.isMesh) {
      child.geometry.computeBoundingBox();
      const box = child.geometry.boundingBox;
      // El punto más alto en Y del mesh
      const localPico = new THREE.Vector3(
        (box.max.x + box.min.x) / 2,
        box.max.y,
        (box.max.z + box.min.z) / 2
      );
      // Transforma a coordenadas globales
      child.localToWorld(localPico);
      if (localPico.y > pico.y) pico.copy(localPico);
    }
  });
  return pico;
};