import { GLTFLoader } from '../../libs/GLTFLoader.js';
import { state } from '../state.js';

export function loadMesa() {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load('../assets/models/mesa/scene.gltf', (gltf) => {
      const s = gltf.scene;
      s.position.set(-38, 10, -2.5); // Posición inicial de la mesa
      s.rotation.y = Math.PI / 2; // Rotar 180 grados en el eje Y
      s.scale.set(7, 7, 7); // Escala aumentada para mejor visibilidad

      // Configurar materiales y sombras de la mesa
      s.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.needsUpdate = true;
        }
      });

      state.scene.add(s); // Agregar la mesa a la escena
      state.modeloMesa = s; // Asignar la mesa al estado
      resolve(s); // Resolver la promesa con el modelo cargado
    }, undefined, (error) => {
      console.error('Error al cargar el modelo de la mesa:', error);
      reject(error); // Rechazar la promesa en caso de error
    });
  });
}

