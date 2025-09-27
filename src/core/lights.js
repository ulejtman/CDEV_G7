export function addLights(scene) {
  const ambient = new THREE.AmbientLight("#ffffff", 1.0);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight("#ffeedd", 1.2);
  sun.position.set(5, 10, 5);
  sun.castShadow = true;
  scene.add(sun);

  const fill = new THREE.HemisphereLight("#fff", "#fff9e8", 0.8);
  scene.add(fill);
}
