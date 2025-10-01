import { GLTFLoader } from '../../libs/GLTFLoader.js';
import { state } from '../state.js';

export function loadParrilla() {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load('assets/models/parrilla/scene.gltf', (gltf) => {
      const parrilla = gltf.scene;
      parrilla.position.set(-35, -21.3, -11); // Posición inicial de la parrilla (al lado de la mesa)
      parrilla.rotation.y = Math.PI / 2; // Rotar 180 grados en el eje Y
      parrilla.scale.set(2, 2, 2); // Escala aumentada para mejor visibilidad

      // Configurar materiales y sombras de la parrilla
      parrilla.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.needsUpdate = true;
        }
      });

      state.scene.add(parrilla); // Agregar la parrilla a la escena
      state.modeloParrilla = parrilla; // Asignar la parrilla al estado
      resolve(parrilla); // Resolver la promesa con el modelo cargado
    }, undefined, (error) => {
      console.error('Error al cargar el modelo de la parrilla:', error);
      reject(error); // Rechazar la promesa en caso de error
    });
  });
}