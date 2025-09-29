import { state } from '../state.js';

export class HandController {
  constructor() {
    this.video = document.createElement('video');
    this.video.style.display = 'none';
    document.body.appendChild(this.video);

    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    this.hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];
        const indexTip = lm[8]; // Punta del dedo índice
        state.pointerX = indexTip.x;
        state.pointerY = indexTip.y;

        const thumbTip = lm[4], pinkyTip = lm[20];
        const dx = thumbTip.x - pinkyTip.x;
        const dy = thumbTip.y - pinkyTip.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isFistNow = dist < 0.20;
        
        // Manejo del tiempo que se mantiene el puño cerrado
        if (isFistNow) {
          if (!state.isFist) { // Si recién se cerró el puño
            state.tiempoDeteccionPuño = Date.now();
          } else if (Date.now() - state.tiempoDeteccionPuño >= state.umbralTiempoPuño) {
            // Si se mantuvo el puño cerrado por suficiente tiempo
            if (state.modo === 'camara') {
              state.modo = 'servir';
              console.log('Cambiando a modo servir');
            } else {
              state.modo = 'camara';
              console.log('Cambiando a modo cámara');
            }
            state.tiempoDeteccionPuño = Date.now(); // Reiniciar el tiempo para evitar cambios múltiples
          }
        }
        state.isFist = isFistNow;

        const palm = lm[9];
        state.handX = palm.x;
        state.handY = palm.y;

        const indexBase = lm[5], pinkyBase = lm[17];
        state.handAngle = Math.atan2(
          pinkyBase.y - indexBase.y,
          pinkyBase.x - indexBase.x
        );
      } else {
        state.isFist = false;
      }
    });

    this.cam = new Camera(this.video, {
      onFrame: async () => {
        if (state.modoDeteccionManos) {
          await this.hands.send({ image: this.video });
        }
      },
      width: 640, height: 480
    });
  }

  start() { this.video.style.display = 'block'; this.cam.start(); }
  stop() { this.video.style.display = 'none'; this.cam.stop(); }
}
