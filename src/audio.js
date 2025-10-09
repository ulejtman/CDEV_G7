import { state } from './state.js';

let payadaSound = null;

export function setupInitialAudio(listener) {
    return new Promise((resolve, reject) => {
        const audioLoader = new THREE.AudioLoader();
        const audio = new THREE.Audio(listener);
        
        audioLoader.load('assets/sounds/sonido_payada.WAV',
            (buffer) => {
                console.log('Payada cargada correctamente');
                audio.setBuffer(buffer);
                audio.setLoop(false);
                audio.setVolume(2.5); // Reducir el volumen a 0.5 (era 5.0)
                // Configurar filtros de audio para mejorar la calidad
                audio.filters = [];
                // Agregar un filtro paso bajo para reducir ruidos de alta frecuencia
                const lowPassFilter = listener.context.createBiquadFilter();
                lowPassFilter.type = 'lowpass';
                lowPassFilter.frequency.value = 2000;
                audio.filters.push(lowPassFilter);
                // Agregar un filtro para mejorar la ganancia
                const gainNode = listener.context.createGain();
                gainNode.gain.value = 0.8;
                audio.filters.push(gainNode);
                
                payadaSound = audio;
                resolve(audio);
            },
            (progress) => {
                console.log('Progreso de carga de payada:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error cargando la payada:', error);
                reject(error);
            }
        );
    });
}

export function playPayada() {
    if (payadaSound && !payadaSound.isPlaying) {
        console.log('Reproduciendo payada automáticamente');
        try {
            payadaSound.play();
        } catch (error) {
            console.error('Error al reproducir la payada:', error);
        }
    }
}

export function stopPayada() {
    if (payadaSound && payadaSound.isPlaying) {
        console.log('Deteniendo payada');
        payadaSound.stop();
    }
}

export function setupAudio(listener) {
    return new Promise((resolve, reject) => {
        const audioLoader = new THREE.AudioLoader();
        const sonidos = [];
        let soundsLoaded = 0;
        const totalSounds = 2;

        const rutasSonidos = [
            'assets/sounds/Canto del Zorzal.mp3',
            'assets/sounds/fuego leña.mp3',
        ];

        rutasSonidos.forEach((ruta, index) => {
            const audio = new THREE.PositionalAudio(listener);
            audioLoader.load(ruta, 
                (buffer) => {
                    console.log(`Audio cargado: ${ruta}`);
                    audio.setBuffer(buffer);
                    audio.setLoop(true);
                    audio.setVolume(5.0);
                    sonidos[index] = audio;
                    soundsLoaded++;

                    if (soundsLoaded === totalSounds) {
                        state.sonidos = sonidos;
                        resolve(sonidos);
                    }
                },
                undefined,
                (error) => {
                    console.error('Error cargando audio:', error);
                    reject(error);
                }
            );
        });
    });
}

export function playAudioOnRightRotation() {
  // Detectar si la cámara está rotando hacia la derecha
  if (state.controls.isRotating && state.controls.rotationDirection === 'right') {
    // Reproducir los sonidos si no están ya reproduciéndose
    state.sonidos.forEach((audio) => {
      if (!audio.isPlaying) {
        console.log('Reproduciendo sonido en bucle:', audio);
        audio.play();
      }
    });
  }

  // Detectar si la cámara está rotando hacia la izquierda
  if (state.controls.isRotating && state.controls.rotationDirection === 'left') {
    // Detener los sonidos inmediatamente
    state.sonidos.forEach((audio) => {
      if (audio.isPlaying) {
        console.log('Deteniendo sonido por rotación hacia la izquierda:', audio);
        audio.stop();
      }
    });
  }
}

export function startAmbientAudio() {
    if (state.sonidos && state.sonidos.length > 0) {
        state.sonidos.forEach(audio => {
            if (audio && !audio.isPlaying) {
                console.log('Iniciando audio ambiental');
                audio.play();
            }
        });
    } else {
        console.warn('No hay sonidos disponibles para reproducir');
    }
}

export function stopAmbientAudio() {
  // Detener todos los sonidos ambientales
  if (state.sonidos && state.sonidos.length > 0) {
    state.sonidos.forEach((audio) => {
      if (audio.isPlaying) {
        console.log('Deteniendo audio ambiental:', audio);
        audio.stop();
      }
    });
  }
}