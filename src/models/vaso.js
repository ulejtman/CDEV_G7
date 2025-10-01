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

      // Configurar el material del vaso para que sea transparente
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = 0.3; // Ajustar la transparencia
          child.material.color.set('#aaaaaa'); // Color más claro para el vidrio
          child.material.needsUpdate = true;
          child.material.side = THREE.DoubleSide; // Renderizar ambos lados
          child.material.refractionRatio = 0.98; // Añadir efecto de vidrio
          child.material.shininess = 100; // Aumentar el brillo
        }
      });

      // Crear el líquido en el vaso
      const geometry = new THREE.CylinderGeometry(0.85, 0.85, 0.05, 32); // Usando el tamaño original
      geometry.translate(0, 0.025, 0); // Mover el punto de origen a la parte superior del cilindro

      const material = new THREE.MeshPhongMaterial({
        color: '#1a0a1a', // Color violeta oscuro tipo vino
        transparent: false,
        shininess: 30,
        specular: 0x330033 // Ajustado el especular para complementar el color vino
      });

      // Crear el mesh del líquido
      state.liquidoMesh = new THREE.Mesh(geometry, material);
      state.liquidoMesh.position.y = -0.3; // Posición Y inicial como en el original
      state.liquidoAltura = 0; // Inicializar altura del líquido
      state.liquidoAlturaMax = 1.8; // Establecer altura máxima

      // Agregar el líquido al vaso
      gltf.scene.add(state.liquidoMesh);
      state.scene.add(gltf.scene); // Agregar el vaso a la escena
      state.modeloVaso = gltf.scene; // Asignar el modelo del vaso al estado
      resolve(gltf.scene); // Resolver la promesa con el modelo cargado
    }, undefined, (error) => {
      console.error('Error al cargar el modelo del vaso:', error);
      reject(error); // Rechazar la promesa en caso de error
    });
  });
}