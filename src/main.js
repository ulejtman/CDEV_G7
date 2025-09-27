import { GLTFLoader } from '../libs/GLTFLoader.js';

// Core
import { createScene } from './core/scene.js';
import { addLights } from './core/lights.js';
import { createSkybox } from './core/skybox.js';
import { createRenderer } from './core/renderer.js';
import { createCamera } from './core/camera.js';
import { createOrbitControls } from './core/controls.js';

// Models (Todavia no estan cargados)

// Input + Loop
import { HandController } from './input/handTracking.js';
import { installModeToggle } from './input/modeToggle.js';
import { startAnimationLoop } from './animate.js';

// Estado
import { state } from './state.js';



//Desde aca para abajo se deberia empezar a crear las funciones importadas de sus respectivos archivos//


// 1) Inicializar núcleo
state.scene = createScene(); 
addLights(state.scene);
createSkybox(state.scene);
state.renderer = createRenderer();
state.camera = createCamera();
state.controls = createOrbitControls(state.camera, state.renderer.domElement);

// 2) Cargar modelos (en paralelo) ( TODAVIA NO ESTA HECHO)

// 3) Manos + toggle de modo (barra espaciadora)
const handController = new HandController();
installModeToggle(handController, state.controls);

// 4) Animación
startAnimationLoop();

// Función para obtener la posición del pico de la botella
function getPicoBotellaPos() {
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

// Cargar la mesa
const mesaLoader = new GLTFLoader();
mesaLoader.load(
  '../assets/models/mesa/scene.gltf',
  function (gltf) {
    gltf.scene.position.x = -38;
    gltf.scene.position.y = 10; // Misma altura que la botella y vaso
    gltf.scene.position.z = -2.5;
    gltf.scene.rotation.y = Math.PI / 2; // Rotar 180 grados en el eje Y
    gltf.scene.scale.set(7, 7, 7); // Escala aumentada para mejor visibilidad
    
    // Configurar materiales y sombras de la mesa
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.needsUpdate = true;
      }
    });
    
    console.log('Mesa cargada correctamente:', gltf);
    state.scene.add(gltf.scene); // Cambiar scene por state.scene
    state.modeloMesa = gltf.scene;
  },
  undefined,
  function (error) {
    console.error('Error al cargar el modelo de la mesa:', error);
  }
);

// Cargar la botella
const botellaLoader = new GLTFLoader();
botellaLoader.load(
  '../assets/models/botella/botella.gltf',
  function (gltf) {
    gltf.scene.position.x = 0;
    gltf.scene.position.y = -21.3; // Sobre la mesa
    gltf.scene.position.z = -2.8;
    gltf.scene.rotation.y = Math.PI;
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    state.scene.add(gltf.scene); // Usar state.scene para agregar el modelo
    state.modeloBotella = gltf.scene; // Asignar el modelo al objeto state
  },
  undefined,
  function (error) {
    console.error('Error al cargar el modelo de la botella:', error);
  }
);

// Cargar el vaso
const vasoLoader = new GLTFLoader();
//let liquidoMesh = null;
//let liquidoAltura = 0;
//const liquidoAlturaMax = 1.8;

vasoLoader.load(
  '../assets/models/vaso/vaso.gltf',
  function (gltf) {
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
    const geometry = new THREE.CylinderGeometry(0.85, 0.85, 18, 32); // Altura inicial ajustada para que sea visible
    geometry.translate(0, 0.5, 0); // Mover el punto de origen a la base del cilindro

    const material = new THREE.MeshPhongMaterial({
        color: '#7a5230', // Color marrón para el líquido
        transparent: false, // Cambiar a true si quieres que sea semitransparente
        shininess: 30,
        specular: 0x666666
    });

    // Crear el mesh del líquido
    state.liquidoMesh = new THREE.Mesh(geometry, material);
    state.liquidoMesh.scale.y = 1; // Escalar el líquido para que sea visible desde el inicio
    state.liquidoMesh.position.y = -20.8; // Ajustar la posición para que esté dentro del vaso
    state.scene.add(state.liquidoMesh); // Agregar el líquido directamente a la escena

    // Asignar el líquido al estado
    state.liquidoMesh = state.liquidoMesh;

    state.scene.add(gltf.scene); // Cambiar scene por state.scene
    state.modeloVaso = gltf.scene;
  },
  undefined,
  function (error) {
    console.error('Error al cargar el modelo del vaso:', error);
  }
);