import { state } from '../state.js';

// Encapsula MediaPipe Hands + Camera
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
        const thumbTip = lm[4], pinkyTip = lm[20];
        const dx = thumbTip.x - pinkyTip.x;
        const dy = thumbTip.y - pinkyTip.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        state.isFist = dist < 0.20;

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
  stop()  { this.video.style.display = 'none';  this.cam.stop();  }
}
