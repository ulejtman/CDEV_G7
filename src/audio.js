import { state } from './state.js';

export function setupAudio(listener) {
  const audioLoader = new THREE.AudioLoader();
  const sonidos = [];

  // Cargar los sonidos
  const rutasSonidos = [
    'assets/sounds/Canto del Zorzal.mp3',
    'assets/sounds/fuego leña.mp3',
  ];

  rutasSonidos.forEach((ruta, index) => {
    const audio = new THREE.PositionalAudio(listener);
    audioLoader.load(ruta, (buffer) => {
      console.log(`Audio cargado: ${ruta}`);
      audio.setBuffer(buffer);
      audio.setLoop(true); // Configurar el sonido para que se reproduzca en bucle
      audio.setVolume(5.0); // Ajustar el volumen a un nivel más alto
    });
    sonidos.push(audio);
  });

  // Guardar los sonidos en el estado global
  state.sonidos = sonidos;
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