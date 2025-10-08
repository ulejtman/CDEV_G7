// Core
import { createScene } from './core/scene.js';
import { addLights } from './core/lights.js';
import { createSkybox } from './core/skybox.js';
import { createRenderer } from './core/renderer.js';
import { createCamera } from './core/camera.js';
import { createOrbitControls } from './core/controls.js';
import { createPointer } from './core/puntero.js';

// Models
import { loadMesa } from './models/mesa.js';
import { loadVaso } from './models/vaso.js';
import { loadBotella } from './models/botella.js';
import { loadCoca } from './models/coca.js'
import { loadTablaQueso } from './models/tablaQueso.js';
import { loadParrilla } from './models/parrilla.js';

// Input + Loop
import { HandController } from './input/handTracking.js';
import { installModeToggle } from './input/modeToggle.js';
import { startAnimationLoop } from './animate.js';

// Estado
import { state } from './state.js';
import { setupAudio, startAmbientAudio, stopAmbientAudio, setupInitialAudio, playPayada, stopPayada } from './audio.js';

// === GESTIÓN DE PANTALLAS ===
let gameInitialized = false;
let initialAudioInitialized = false;

function showStartScreen() {
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameCanvas').classList.add('hidden');
    stopAmbientAudio();
    
    // Mostrar nuevamente el overlay de inicio
    setupInitialScreen();
}

async function setupInitialScreen() {
    const listener = new THREE.AudioListener();
    try {
        // Configurar el audio inicial
        await setupInitialAudio(listener);
        
        // Remover overlay anterior si existe
        const existingOverlay = document.querySelector('.start-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Crear y configurar el nuevo overlay
        const startOverlay = document.createElement('div');
        startOverlay.classList.add('start-overlay');
        startOverlay.style.position = 'fixed';
        startOverlay.style.top = '22%';
        startOverlay.style.left = '50%';
        startOverlay.style.transform = 'translate(-50%, -50%)';
        startOverlay.style.padding = '20px';
        startOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        startOverlay.style.color = 'white';
        startOverlay.style.pointerEvents = 'none'; // Permitir que los clics pasen a través del overlay
        startOverlay.style.zIndex = '1000';
        startOverlay.textContent = 'Haz clic en cualquier lugar para comenzar la experiencia';
        
        document.body.appendChild(startOverlay);

        // Esperar el primer clic del usuario
        const waitForUserInteraction = new Promise(resolve => {
            const handleClick = async () => {
                const audioContext = THREE.AudioContext.getContext();
                await audioContext.resume();
                playPayada();
                
                // Verificar si el overlay aún existe antes de intentar eliminarlo
                const overlayToRemove = document.querySelector('.start-overlay');
                if (overlayToRemove) {
                    overlayToRemove.remove();
                }
                
                initialAudioInitialized = true;
                resolve();
            };
            
            // Agregar el event listener al document en lugar del overlay
            document.addEventListener('click', handleClick, { once: true });
        });

        await waitForUserInteraction;

    } catch (error) {
        console.error('Error al configurar el audio inicial:', error);
    }
}

function showGameScreen() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameCanvas').classList.remove('hidden');
    
    // Inicializar el juego solo la primera vez
    if (!gameInitialized) {
        initializeGame().then(() => {
            // Iniciar el audio solo después de que todo esté inicializado
            const audioContext = THREE.AudioContext.getContext();
            if (audioContext) {
                audioContext.resume().then(() => {
                    console.log('Contexto de audio reanudado');
                    startAmbientAudio();
                });
            }
            gameInitialized = true;
        });
    } else {
        startAmbientAudio();
    }
}

async function initializeGame() {
    console.log('🎮 Iniciando la experiencia del campo argentino...');

    // 1) Configurar el audio primero y esperar a que se cargue
    const listener = new THREE.AudioListener();
    try {
        await setupAudio(listener);
        console.log('Audio configurado correctamente');
    } catch (error) {
        console.error('Error al configurar el audio:', error);
    }

    // 2) Inicializar núcleo
    state.scene = createScene(); 
    state.camera = createCamera();
    state.camera.add(listener); // Agregar el listener a la cámara
    addLights(state.scene);
    createSkybox(state.scene);
    state.renderer = createRenderer();
    state.controls = createOrbitControls(state.camera, state.renderer.domElement);
    createPointer(state.scene);

    // Agregar el renderer al contenedor del canvas
    document.getElementById('gameCanvas').appendChild(state.renderer.domElement);

    // Inicializar controlador de manos
    state.handController = new HandController();

    // 2) Cargar modelos
    
    //Cargar la mesa
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

    // 3) Manos + toggle de modo
    const handController = new HandController();
    installModeToggle(handController, state.controls);

    // 4) Animación (sin audio)
    startAnimationLoop();
}

// === CONFIGURACIÓN DE EVENTOS ===
document.addEventListener('DOMContentLoaded', async function() {
    showStartScreen();
    
    // Configurar el audio inicial al cargar la página
    if (!initialAudioInitialized) {
        await setupInitialScreen();
    }
    
    // Event listener para el botón de jugar
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.addEventListener('click', async function() {
            console.log('🌾 ¡Bienvenido al campo argentino!');
            
            try {
                stopPayada();
                showGameScreen();
            } catch (error) {
                console.error('Error al iniciar el audio:', error);
            }
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

