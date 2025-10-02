import { GLTFLoader } from '../../libs/GLTFLoader.js';
import { state } from '../state.js';

export function loadTablaQueso() {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load('assets/models/tablaQueso/scene.gltf', (gltf) => {
      const tablaQueso = gltf.scene;
      tablaQueso.position.set(3.5, -21.3, -3); // Posición inicial sobre la mesa
      tablaQueso.rotation.y = Math.PI / 2; // Rotar 90 grados en el eje Y
      tablaQueso.scale.set(8, 8, 8); // Ajustar la escala para mejor visibilidad

      // Configurar materiales y sombras de la tabla de queso
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.needsUpdate = true;
        }
      });

      state.scene.add(tablaQueso); // Agregar la tabla de queso a la escena
      state.modeloTablaQueso = tablaQueso; // Asignar la tabla de queso al estado
      resolve(tablaQueso); // Resolver la promesa con el modelo cargado
    }, undefined, (error) => {
      console.error('Error al cargar el modelo de la tabla de queso:', error);
      reject(error); // Rechazar la promesa en caso de error
    });
  });
}