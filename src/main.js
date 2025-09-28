// Core
import { createScene } from './core/scene.js';
import { addLights } from './core/lights.js';
import { createSkybox } from './core/skybox.js';
import { createRenderer } from './core/renderer.js';
import { createCamera } from './core/camera.js';
import { createOrbitControls } from './core/controls.js';

// Models (Todavia no estan cargados)
import { loadMesa } from './models/mesa.js';
import { loadVaso } from './models/vaso.js';
import { loadBotella } from './models/botella.js';

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
// Cargar la mesa
loadMesa().then((mesa) => {
  console.log('Mesa cargada correctamente:', mesa);
}).catch((error) => {
  console.error('Error al cargar la mesa:', error);
});

// Cargar el vaso
loadVaso().then((vaso) => {
  console.log('Vaso cargado correctamente:', vaso);
}).catch((error) => {
  console.error('Error al cargar el vaso:', error);
});

// Cargar la botella
loadBotella().then((botella) => {
  console.log('Botella cargada correctamente:', botella);
}).catch((error) => {
  console.error('Error al cargar la botella:', error);
});

// 3) Manos + toggle de modo (barra espaciadora)
const handController = new HandController();
installModeToggle(handController, state.controls);

// 4) Animación
startAnimationLoop();

