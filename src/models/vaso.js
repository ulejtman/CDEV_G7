import { GLTFLoader } from '../../libs/GLTFLoader.js';
import { state } from '../state.js';

export function loadVaso() {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load('assets/models/vaso/vaso.gltf', (gltf) => {
      gltf.scene.position.x = 1;
      gltf.scene.position.y = -21.3; // Sobre la mesa
      gltf.scene.position.z = -2.8;
      gltf.scene.rotation.y = Math.PI;
      gltf.scene.scale.set(0.5, 0.5, 0.5);

      // Configurar el material del vaso
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.color.set('#552828'); // Corregir el color hexadecimal
          child.material.needsUpdate = true;
        }
      });

      // Crear el líquido en el vaso
      const geometry = new THREE.CylinderGeometry(0.42, 0.42, 0.05, 32); // Altura inicial ajustada para que sea visible
      geometry.translate(0, 0.025, 0); // Mover el punto de origen a la base del cilindro

      const material = new THREE.MeshPhongMaterial({
        color: '#7a5230', // Color marrón para el líquido
        transparent: false, // Cambiar a true si quieres que sea semitransparente
        shininess: 30,
        specular: 0x666666
      });

      // Crear el mesh del líquido
      state.liquidoMesh = new THREE.Mesh(geometry, material);
      state.liquidoMesh.position.y = -0.3;
      state.liquidoMesh.scale.y = 0.01; // Escalar el líquido para que sea visible desde el inicio

      // Alinear la posición del líquido con la posición del vaso
      state.liquidoMesh.position.set(
        gltf.scene.position.x, // Posición X del vaso
        gltf.scene.position.y, // Posición Y del vaso
        gltf.scene.position.z  // Posición Z del vaso
      );

      state.scene.add(state.liquidoMesh); // Agregar el líquido directamente a la escena
      state.scene.add(gltf.scene); // Agregar el vaso a la escena
      state.modeloVaso = gltf.scene; // Asignar el modelo del vaso al estado
      resolve(gltf.scene); // Resolver la promesa con el modelo cargado
    }, undefined, (error) => {
      console.error('Error al cargar el modelo del vaso:', error);
      reject(error); // Rechazar la promesa en caso de error
    });
  });
}