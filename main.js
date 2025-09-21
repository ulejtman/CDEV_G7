// Crear la escena
const escena = new THREE.Scene();


// Importar GLTFLoader
import { GLTFLoader } from './libs/GLTFLoader.js';


// Cámara ortográfica
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 7;
const camara = new THREE.OrthographicCamera(
  frustumSize * aspect / -2, // left
  frustumSize * aspect / 2,  // right
  frustumSize / 2,           // top
  frustumSize / -2,          // bottom
  0.1,                      // near
  1000                      // far
);
camara.position.z = 5;

// Renderizador
const renderizador = new THREE.WebGLRenderer({
  canvas: document.querySelector("#miCanvas"),
  antialias: true
});
renderizador.setSize(window.innerWidth, window.innerHeight);

// Agregar una luz Direccional
const luz = new THREE.DirectionalLight("#ebd0b7", 2);
luz.position.set(0, 0, 5);
escena.add(luz);


// 5. Cargar texturas para el skybox
const loader = new THREE.TextureLoader();
const materialArray = [];

const sides = ['right', 'left', 'up', 'down', 'back', 'front'];
sides.forEach((side) => {
  const texture = loader.load(`assets/images/cube_${side}.png`);
  materialArray.push(
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide, // Mostrar desde dentro del cubo
    })
  );
});

// Crear el cubo skybox
const skyboxGeo = new THREE.BoxGeometry(18, 18, 1);
const skybox = new THREE.Mesh(skyboxGeo, materialArray);
escena.add(skybox);


// Cargar el modelo GLTF de la botella
let modeloGLTF = null;
let modeloVaso = null;
let mixer = null;

// Botella
const plane = new GLTFLoader();
plane.load(
  'assets/models/botella/botella.gltf',
  function (gltf) {
    gltf.scene.position.x = 0; // Centrado
    gltf.scene.position.y = 0; // Centrado
    gltf.scene.position.z = 0.1;
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    escena.add(gltf.scene);
    modeloGLTF = gltf.scene;
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
  },
  undefined,
  function (error) {
    console.error('Error al cargar el modelo GLTF:', error);
  }
);

// Vaso
const vasoLoader = new GLTFLoader();
let liquidoMesh = null;
let liquidoAltura = 0;
const liquidoAlturaMax = 1.8; // Aumentado de 0.4 a 0.8 para permitir más altura

vasoLoader.load(
  'assets/models/vaso/vaso.gltf',
  function (gltf) {
    gltf.scene.position.x = -frustumSize * aspect / 4;
    gltf.scene.position.y = 0;
    gltf.scene.position.z = 0.1;
    gltf.scene.scale.set(0.5, 0.5, 0.5);

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = false;
        child.material.opacity = 1.0;
        child.material.color.set('#552828ff');
        child.material.needsUpdate = true;
      }
    });

    // Crear el mesh del líquido (más pequeño y marrón)
    const geometry = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 12); // Altura inicial muy pequeña
    const material = new THREE.MeshStandardMaterial({
      color: '#7a5230',
      roughness: 0.8,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    liquidoMesh = new THREE.Mesh(geometry, material);

    // Ajustar posición inicial más arriba (dentro del vaso)
    liquidoMesh.position.y = -0.15; // Cambia este valor para ajustar altura inicial
    liquidoMesh.position.z = 0.12;

    gltf.scene.add(liquidoMesh);

    escena.add(gltf.scene);
    modeloVaso = gltf.scene;
  },
  undefined,
  function (error) {
    console.error('Error al cargar el modelo GLTF del vaso:', error);
  }
);


// Variables para la posición de la mano
let handX = 0;
let handY = 0;
let isFist = false;
let handAngle = 0;

// Inicializa MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// Callback cuando se detecta una mano
hands.onResults((results) => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    // Detectar puño cerrado (distancia entre pulgar y meñique)
    const thumbTip = landmarks[4];
    const pinkyTip = landmarks[20];
    const dist = Math.sqrt(
      Math.pow(thumbTip.x - pinkyTip.x, 2) +
      Math.pow(thumbTip.y - pinkyTip.y, 2)
    );
    isFist = dist < 0.20; // Más sensible para puño cerrado

    // Posición de la mano (centro de la palma)
    const palm = landmarks[9];
    handX = palm.x;
    handY = palm.y;

    // Calcular ángulo de rotación de la mano (base índice y base meñique)
    const indexBase = landmarks[5];
    const pinkyBase = landmarks[17];
    handAngle = Math.atan2(
      pinkyBase.y - indexBase.y,
      pinkyBase.x - indexBase.x
    );
  } else {
    isFist = false;
  }
});

// Inicializa la cámara
const videoElement = document.createElement('video');
videoElement.style.display = 'none';
document.body.appendChild(videoElement);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480
});
camera.start();


// Guardar posición y rotación original de la botella
let originalPosition = null;
let originalRotation = null;

// Función para obtener la posición del pico de la botella
function getPicoBotellaPos() {
  if (!modeloGLTF) return null;
  // Encuentra el punto más alto en Y de la botella
  let pico = new THREE.Vector3();
  modeloGLTF.updateMatrixWorld();
  modeloGLTF.traverse((child) => {
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
}

// Animación 
let clock = new THREE.Clock();
function animar() {
  requestAnimationFrame(animar);


  if (modeloGLTF && modeloVaso && liquidoMesh) {
    const picoBotella = getPicoBotellaPos();
    const vasoPos = new THREE.Vector3();
    modeloVaso.getWorldPosition(vasoPos);

    const distancia = picoBotella ? picoBotella.distanceTo(vasoPos) : 999;
    // Detecta inclinación en ambas direcciones usando valor absoluto
    const botellaApuntando = Math.abs(modeloGLTF.rotation.z) > 0.3;

    const puedeLlenar = distancia < 1.2 && botellaApuntando;

    if (puedeLlenar && liquidoAltura < liquidoAlturaMax) {
      liquidoAltura += 0.01; // Velocidad de llenado más lenta para mayor control
      const color = new THREE.Color('#7a5230');
      liquidoMesh.material.color.copy(color);
    }

    // Ajusta la escala y posición para un crecimiento más notable
    liquidoMesh.scale.y = liquidoAltura * 5; // Multiplicador aumentado para mayor altura
    liquidoMesh.position.y = -0.2 + (liquidoAltura); // Ajuste de posición para mantener base fija
  }

  if (modeloGLTF) {
    if (isFist) {
      // Mover y rotar la botella con la mano
      modeloGLTF.position.x = -(handX - 0.5) * frustumSize * aspect;
      modeloGLTF.position.y = (0.5 - handY) * frustumSize;
      modeloGLTF.rotation.z = handAngle; // Rotación tipo "servir"
    } else {
      // Dejar la botella en el centro y con rotación recta
      modeloGLTF.position.x = 0;
      modeloGLTF.position.y = 0;
      modeloGLTF.rotation.z = 0;
    }
  }

  if (mixer) {
    let delta = clock.getDelta();
    mixer.update(delta);
  }
  renderizador.render(escena, camara);
}
animar();
