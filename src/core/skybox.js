export function createSkybox(scene) {
  const loader = new THREE.TextureLoader();
  
  // Crear skybox esférico con la imagen panorámica 360°
  const texture = loader.load('assets/textures/campo-verde.jpg');
  
  // Configurar el wrapping de la textura para panorámicas
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(-1, 1); // Invertir horizontalmente para corregir la orientación
  
  // Crear esfera grande con más segmentos para mejor calidad
  const geometry = new THREE.SphereGeometry(500, 64, 32);
  
  // Corregir las coordenadas UV para mapeo equirectangular
  const uvs = geometry.attributes.uv.array;
  for (let i = 0; i < uvs.length; i += 2) {
    // Invertir coordenada U (horizontal) para corregir la orientación
    uvs[i] = 1 - uvs[i];
  }
  geometry.attributes.uv.needsUpdate = true;
  
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide // Renderizar desde adentro de la esfera
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  
  // Rotar la esfera para orientar correctamente la imagen
  mesh.rotation.y = Math.PI;
  
  scene.add(mesh);
  return mesh;
}
