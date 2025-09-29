import { GLTFLoader } from '../../libs/GLTFLoader.js';
import { state } from '../state.js';

export function loadCoca() {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load('assets/models/coca/coca.gltf', (gltf) => {
      gltf.scene.position.x = -1;
      gltf.scene.position.y = -21.3; // Sobre la mesa
      gltf.scene.position.z = -2.8;
      gltf.scene.rotation.y = Math.PI;
      gltf.scene.scale.set(6, 6, 6);
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.needsUpdate = true;
        }
      });

      state.scene.add(gltf.scene); // Agregar la botella a la escena
      state.modeloCoca = gltf.scene; // Asignar el modelo de la botella de coca al estado
      resolve(gltf.scene); // Resolver la promesa con el modelo cargado
    }, undefined, (error) => {
      console.error('Error al cargar el modelo de la botella de coca:', error);
      reject(error); // Rechazar la promesa en caso de error
    });
  });
}
