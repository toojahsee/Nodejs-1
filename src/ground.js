// ground.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export async function createSceneObjects() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 6, -15);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  // 跑道
  const runwayWidth = 20;
  const runwayLength = 70;
  const texture = new THREE.TextureLoader().load("https://threejs.org/examples/textures/uv_grid_opengl.jpg");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 8);

  const runwayMat = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
  const runway1 = new THREE.Mesh(new THREE.PlaneGeometry(runwayWidth, runwayLength), runwayMat);
  const runway2 = new THREE.Mesh(new THREE.PlaneGeometry(runwayWidth, runwayLength), runwayMat);

  runway1.rotation.x = runway2.rotation.x = -Math.PI / 2;
  runway1.position.z = 0;
  runway2.position.z = runwayLength;

  scene.add(runway1, runway2);

  const runway = { runway1, runway2, runwayWidth, runwayLength, runwayHeight: 0 };

  // 月亮
  const moonTexture = new THREE.TextureLoader().load("./666.jpg");
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(15, 64, 64),
    new THREE.MeshStandardMaterial({ map: moonTexture })
  );
  moon.position.set(0, 50, 200);
  scene.add(moon);

  // Dino 模型
  const loader = new GLTFLoader();
  const dinoData = await new Promise((resolve) => {
    loader.load('./scene2.gltf', (gltf) => {
      const dino = gltf.scene;
      dino.scale.set(1.5, 1.5, 1.5);
      dino.position.set(0, runway.runwayHeight, 2);
      scene.add(dino);

      let mixer = null;
      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(dino);
        mixer.clipAction(gltf.animations[0]).play();
      }

      resolve({ model: dino, mixer });
    });
  });

  // Thanos 模型
  const thanosData = await new Promise((resolve) => {
    loader.load('./thanos.gltf', (gltf) => {
      const thanos = gltf.scene;
      thanos.scale.set(0.15, 0.15, 0.15);
      thanos.position.set(0, runway.runwayHeight, 50);
      scene.add(thanos);

      resolve({ model: thanos });
    });
  });

  return { scene, camera, renderer, runway, moon, dinoData, thanosData, texture };
}
