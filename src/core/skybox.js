export function createSkybox(scene) {
  const loader = new THREE.TextureLoader();
  const sides = ['right','left','up','down','back','front'];
  const mats = sides.map(side => new THREE.MeshBasicMaterial({
    map: loader.load(`assets/textures/cube_${side}.jpg`),
    side: THREE.BackSide
  }));
  const geo = new THREE.BoxGeometry(400, 50, 400);
  const mesh = new THREE.Mesh(geo, mats);
  scene.add(mesh);
  return mesh;
}
