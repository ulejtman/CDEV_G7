// Core
import { createScene } from './core/scene.js';
import { addLights } from './core/lights.js';
import { createSkybox } from './core/skybox.js';
import { createRenderer } from './core/renderer.js';
import { createCamera } from './core/camera.js';
import { createOrbitControls } from './core/controls.js';
import { createPointer } from './core/puntero.js';

// Models (Todavia no estan cargados)
import { loadMesa } from './models/mesa.js';
import { loadVaso } from './models/vaso.js';
import { loadBotella } from './models/botella.js';
import { loadCoca } from './models/coca.js'
import { loadTablaQueso } from './models/tablaQueso.js';

// Input + Loop
import { HandController } from './input/handTracking.js';
import { installModeToggle } from './input/modeToggle.js';
import { startAnimationLoop } from './animate.js';

// Estado
import { state } from './state.js';
import { setupAudio, playAudioOnRightRotation } from './audio.js';
import { loadParrilla } from './models/parrilla.js';

// === GESTIÓN DE PANTALLAS ===
let gameInitialized = false;

function showStartScreen() {
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameCanvas').classList.add('hidden');
}

function showGameScreen() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameCanvas').classList.remove('hidden');
    
    // Inicializar el juego solo la primera vez
    if (!gameInitialized) {
        initializeGame();
        gameInitialized = true;
    }
}

function initializeGame() {
    console.log('🎮 Iniciando la experiencia del campo argentino...');



    //Desde aca para abajo se deberia empezar a crear las funciones importadas de sus respectivos archivos//

    // 1) Inicializar núcleo
    state.scene = createScene(); 
    addLights(state.scene);
    createSkybox(state.scene);
    state.renderer = createRenderer();
    state.camera = createCamera();
    state.controls = createOrbitControls(state.camera, state.renderer.domElement);
    createPointer(state.scene);

    // Agregar el renderer al contenedor del canvas
    document.getElementById('gameCanvas').appendChild(state.renderer.domElement);

    // Inicializar controlador de manos
    state.handController = new HandController();

    // Configurar el audio
    const listener = new THREE.AudioListener();
    state.camera.add(listener); // Agregar el listener a la cámara
    setupAudio(listener);

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

    // Cargar la botella de fetnet
    loadBotella().then((botella) => {
      console.log('Botella cargada correctamente:', botella);
    }).catch((error) => {
      console.error('Error al cargar la botella:', error);
    });

    // Cargar la botella de coca
    loadCoca().then((coca) => {
      console.log('Coca cargada correctamente:', coca);
    }).catch((error) => {
      console.error('Error al cargar la coca:', error);
    });

    //Cargar la parrilla
    loadParrilla().then((parrilla) => {
      console.log('Parrilla cargada correctamente:', parrilla);
    }).catch((error) => {
      console.error('Error al cargar la parrilla:', error);
    });

    // Cargar la tabla de queso
    loadTablaQueso().then((tablaQueso) => {
      console.log('Tabla de queso cargada correctamente:', tablaQueso);
    }).catch((error) => {
      console.error('Error al cargar la tabla de queso:', error);
    });

    // 3) Manos + toggle de modo (barra espaciadora)
    const handController = new HandController();
    installModeToggle(handController, state.controls);

    // 4) Animación
    startAnimationLoop(() => {
      playAudioOnRightRotation(); // Verificar y reproducir sonidos en cada cuadro
    });
}

// === CONFIGURACIÓN DE EVENTOS ===
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar pantalla de inicio al cargar la página
    showStartScreen();
    
    // Event listener para el botón de jugar
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.addEventListener('click', function() {
            console.log('🌾 ¡Bienvenido al campo argentino!');
            showGameScreen();
        });
    }
    
    // Event listener para el botón de volver al menú
    const backButton = document.getElementById('backToMenuButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            showStartScreen();
        });
    }
});

