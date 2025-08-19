import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 摄像机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 4);

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// 控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 地板
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 变量
let thanos;
const speed = 0.05;
const keys = {};

// 键盘监听
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// 加载模型
const loader = new GLTFLoader();
loader.load('./thanos.gltf', (gltf) => {
  thanos = gltf.scene;
  thanos.scale.set(1, 1, 1);
  thanos.position.set(0, 0, 0);
  scene.add(thanos);
});

// UI 按钮（适配移动端）
function createButton(id, text, x, y) {
  const btn = document.createElement('button');
  btn.innerText = text;
  btn.id = id;
  btn.style.position = 'absolute';
  btn.style.left = x + 'px';
  btn.style.bottom = y + 'px';
  btn.style.width = '50px';
  btn.style.height = '50px';
  btn.style.borderRadius = '50%';
  btn.style.background = 'rgba(255,255,255,0.5)';
  btn.style.border = 'none';
  btn.style.fontSize = '20px';
  btn.style.userSelect = 'none';
  btn.style.touchAction = 'none';
  document.body.appendChild(btn);
  return btn;
}

const upBtn = createButton('upBtn', '↑', 60, 120);
const leftBtn = createButton('leftBtn', '←', 0, 60);
const downBtn = createButton('downBtn', '↓', 60, 60);
const rightBtn = createButton('rightBtn', '→', 120, 60);

// 按钮事件
function bindBtn(btn, key) {
  btn.addEventListener('touchstart', () => (keys[key] = true));
  btn.addEventListener('touchend', () => (keys[key] = false));
}
bindBtn(upBtn, 'ArrowUp');
bindBtn(downBtn, 'ArrowDown');
bindBtn(leftBtn, 'ArrowLeft');
bindBtn(rightBtn, 'ArrowRight');

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  if (thanos) {
    if (keys['w'] || keys['ArrowUp']) thanos.position.z -= speed;
    if (keys['s'] || keys['ArrowDown']) thanos.position.z += speed;
    if (keys['a'] || keys['ArrowLeft']) thanos.position.x -= speed;
    if (keys['d'] || keys['ArrowRight']) thanos.position.x += speed;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();