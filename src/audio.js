import { state } from './state.js';

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