export function createOrbitControls(camera, domElement) {
  const controls = new THREE.OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI;
  controls.target.set(0, -23, -1);// Punto de mira al nivel del suelo // Punto hacia donde mira la cámara inicialmente // Limit vertical rotation to prevent going below ground
  return controls;
}
