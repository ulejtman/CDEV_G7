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

  async start() {
    try {
      console.log('Iniciando detección de manos...');
      this.video.style.display = 'block';
      await this.hands.initialize();
      console.log('MediaPipe Hands inicializado');
      await this.cam.start();
      console.log('Cámara iniciada');
      state.modoDeteccionManos = true;
    } catch (error) {
      console.error('Error al iniciar la detección de manos:', error);
    }
  }

  async stop() {
    try {
      console.log('Deteniendo detección de manos...');
      this.video.style.display = 'none';
      await this.cam.stop();
      state.modoDeteccionManos = false;
      console.log('Detección de manos detenida');
    } catch (error) {
      console.error('Error al detener la detección de manos:', error);
    }
  }
}
