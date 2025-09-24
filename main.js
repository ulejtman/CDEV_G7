
import { GLTFLoader } from './libs/GLTFLoader.js';

// 1. Crear escena
const scene = new THREE.Scene();

// 2. Crear renderer primero
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 3. Configurar iluminación para ambiente exterior
const ambientLight = new THREE.AmbientLight("#ffffff", 1.0); // Luz ambiente más intensa
scene.add(ambientLight);

// Luz direccional principal (simula el sol)
const sunLight = new THREE.DirectionalLight("#ffeedd", 1.2);
sunLight.position.set(5, 10, 5);
sunLight.castShadow = true;
scene.add(sunLight);

// Luz de relleno para sombras suaves
const fillLight = new THREE.HemisphereLight("#fff", "#fff9e8", 0.8);
scene.add(fillLight);


// 2. Crear cámara
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(7, -23, 0); // Posicionar la cámara cerca del suelo del skybox expandido


// Ya se creó el renderer anteriormente

// 4. Controles orbitales
const controls = new THREE.OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI;
controls.target.set(0, -23, -1); // Punto de mira al nivel del suelo // Punto hacia donde mira la cámara inicialmente // Limit vertical rotation to prevent going below ground

// 5. Cargar texturas para el skybox
const loader = new THREE.TextureLoader();
const materialArray = [];

const sides = ['right', 'left', 'up', 'down', 'back', 'front'];

sides.forEach((side) => {
  const texture = loader.load(`assets/textures/cube_${side}.jpg`);
  materialArray.push(
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide, // Mostrar desde dentro del cubo
    })
  );
});


// 6. Crear la geometría del cubo
const skyboxGeo = new THREE.BoxGeometry(400, 50, 400); // Más ancho y profundo para suelo y cielo más amplios
const skybox = new THREE.Mesh(skyboxGeo, materialArray);
scene.add(skybox);

// Variables para los modelos
let modeloGLTF = null;
let modeloVaso = null;
let modeloMesa = null;
let mixer = null;

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
};

// Cargar la mesa
const mesaLoader = new GLTFLoader();
mesaLoader.load(
  'assets/models/mesa/scene.gltf',
  function (gltf) {
    gltf.scene.position.x = 0;
    gltf.scene.position.y = 10; // Misma altura que la botella y vaso
    gltf.scene.position.z = 10;
    gltf.scene.rotation.y = Math.PI;
    gltf.scene.scale.set(6, 6, 6); // Escala aumentada para mejor visibilidad
    
    // Configurar materiales y sombras de la mesa
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.needsUpdate = true;
      }
    });
    
    console.log('Mesa cargada correctamente:', gltf);
    scene.add(gltf.scene);
    modeloMesa = gltf.scene;
  },
  undefined,
  function (error) {
    console.error('Error al cargar el modelo de la mesa:', error);
  }
);

// Cargar la botella
const botellaLoader = new GLTFLoader();
botellaLoader.load(
  'assets/models/botella/botella.gltf',
  function (gltf) {
    gltf.scene.position.x = 0;
    gltf.scene.position.y = -22.3; // Sobre la mesa
    gltf.scene.position.z = -2.8;
    gltf.scene.rotation.y = Math.PI;
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    scene.add(gltf.scene);
    modeloGLTF = gltf.scene;
  },
  undefined,
  function (error) {
    console.error('Error al cargar el modelo de la botella:', error);
  }
);

// Cargar el vaso
const vasoLoader = new GLTFLoader();
let liquidoMesh = null;
let liquidoAltura = 0;
const liquidoAlturaMax = 1.8;

vasoLoader.load(
  'assets/models/vaso/vaso.gltf',
  function (gltf) {
    gltf.scene.position.x = 1;
    gltf.scene.position.y = -22.3; // Sobre la mesa
    gltf.scene.position.z = -2.8;
    gltf.scene.rotation.y = Math.PI;
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    
    // Configurar el material del vaso
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = false;
        child.material.opacity = 1.0;
        child.material.color.set('#552828ff');
        child.material.needsUpdate = true;
      }
    });

    // Crear el líquido en el vaso
    const geometry = new THREE.CylinderGeometry(0.85, 0.85, 0.05, 32);
    const material = new THREE.MeshPhongMaterial({
      color: '#7a5230',
      transparent: false,
      shininess: 30,
      specular: 0x666666
    });
    liquidoMesh = new THREE.Mesh(geometry, material);
    liquidoMesh.position.y = -0.3;
    liquidoMesh.position.z = 0;
    gltf.scene.add(liquidoMesh);

    scene.add(gltf.scene);
    modeloVaso = gltf.scene;
  },
  undefined,
  function (error) {
    console.error('Error al cargar el modelo del vaso:', error);
  }
);

// Variables de control del modo de interacción
let modoDeteccionManos = false;
let velocidadMovimiento = 0.1;
let sensibilidadMouse = 0.002;
let mouseX = 0;
let mouseY = 0;

// Variables para la posición de la mano
let handX = 0;
let handY = 0;
let isFist = false;
let handAngle = 0;

// Variables para el control de movimiento
const frustumSize = 10;
const aspect = window.innerWidth / window.innerHeight;

// Función para alternar entre modos
function alternarModo(event) {
    if (event.code === 'Space') {
        modoDeteccionManos = !modoDeteccionManos;
        if (modoDeteccionManos) {
            iniciarDeteccionManos();
            controls.enabled = false;
        } else {
            detenerDeteccionManos();
            controls.enabled = true;
        }
    }
}

// Función para iniciar la detección de manos
function iniciarDeteccionManos() {
    videoElement.style.display = 'block';
    handCamera.start();
}

// Función para detener la detección de manos
function detenerDeteccionManos() {
    videoElement.style.display = 'none';
    handCamera.stop();
}

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

    // Calcular ángulo de rotación de la mano
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

const handCamera = new Camera(videoElement, {
  onFrame: async () => {
    if (modoDeteccionManos) {
      await hands.send({image: videoElement});
    }
  },
  width: 640,
  height: 480
});

// Agregar event listener para la tecla espacio
document.addEventListener('keydown', alternarModo);

// 7. Loop de animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (modeloGLTF && modoDeteccionManos) {
    if (isFist) {
      // Mover y rotar la botella con la mano (controles invertidos para vista trasera)
      modeloGLTF.position.x = (handX - 0.5) * frustumSize * aspect; // Invertido el signo
      modeloGLTF.position.y = -22.3 + ((0.5 - handY) * frustumSize); // Ajustado para altura del suelo
      modeloGLTF.rotation.z = handAngle; // Rotación normal para que coincida con el movimiento de la mano

      // Verificar si la botella está inclinada y cerca del vaso
      if (modeloVaso && liquidoMesh) {
        const distancia = Math.abs(modeloGLTF.position.x - modeloVaso.position.x);
        const botellaInclinada = Math.abs(modeloGLTF.rotation.z) > 0.1;

        if (distancia < 2.0 && botellaInclinada && liquidoAltura < liquidoAlturaMax) {
          liquidoAltura += 0.01;
          liquidoMesh.scale.y = liquidoAltura * 8;
          liquidoMesh.position.y = -0.3 + (liquidoAltura * 0.8);
        }
      }
    } else {
      // Volver la botella a su posición original
      modeloGLTF.position.x = 0;
      modeloGLTF.position.y = -22.3;
      modeloGLTF.rotation.z = 0;
    }
  }

  renderer.render(scene, camera);
}
animate();

// 8. Ajustar a cambio de tamaño de ventana
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});