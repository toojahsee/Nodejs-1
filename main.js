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
let thanos, dino;
let dinoMixer; // 恐龙动画控制器
const clock = new THREE.Clock();
const speed = 0.05;
const keys = {};
let started = false;

// 键盘监听
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// === 进度条 DOM ===
const progressContainer = document.createElement('div');
progressContainer.style.position = 'absolute';
progressContainer.style.top = '50%';
progressContainer.style.left = '50%';
progressContainer.style.transform = 'translate(-50%, -50%)';
progressContainer.style.width = '60%';
progressContainer.style.height = '30px';
progressContainer.style.background = 'rgba(0,0,0,0.6)';
progressContainer.style.border = '2px solid #0ff';
progressContainer.style.borderRadius = '15px';
progressContainer.style.overflow = 'hidden';
progressContainer.style.boxShadow = '0 0 20px #0ff, 0 0 40px #0ff';
document.body.appendChild(progressContainer);

const progressBar = document.createElement('div');
progressBar.style.height = '100%';
progressBar.style.width = '0%';
progressBar.style.background = 'linear-gradient(90deg, #0ff, #0f0, #ff0, #f0f)';
progressBar.style.backgroundSize = '400% 100%';
progressBar.style.animation = 'glowMove 3s linear infinite';
progressContainer.appendChild(progressBar);

const progressText = document.createElement('div');
progressText.style.position = 'absolute';
progressText.style.top = '50%';
progressText.style.left = '50%';
progressText.style.transform = 'translate(-50%, -50%)';
progressText.style.color = '#fff';
progressText.style.fontSize = '18px';
progressText.style.fontFamily = 'monospace';
progressText.style.textShadow = '0 0 10px #0ff, 0 0 20px #0ff';
progressContainer.appendChild(progressText);

const style = document.createElement('style');
style.innerHTML = `
@keyframes glowMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 400% 50%; }
}
.start-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 50px;
  font-size: 24px;
  font-family: monospace;
  color: #0ff;
  background: rgba(0,0,0,0.8);
  border: 2px solid #0ff;
  border-radius: 15px;
  cursor: pointer;
  text-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
  box-shadow: 0 0 20px #0ff, 0 0 40px #0ff;
  transition: 0.3s;
}
.start-btn:hover {
  background: #0ff;
  color: #000;
  text-shadow: none;
}
`;
document.head.appendChild(style);

// === GLTF 加载器 ===
const loader = new GLTFLoader();
loader.setPath('/');

// 加载 Thanos
loader.load(
  './thanos.gltf',
  (gltf) => {
    thanos = gltf.scene;
    thanos.scale.set(0.05, 0.05, 0.05);
    thanos.position.set(0, 0, 0);
    scene.add(thanos);

    // 加载恐龙
    loader.load(
      './scene2.gltf',
      (gltf2) => {
        dino = gltf2.scene;
        dino.scale.set(1.5, 1.5, 1.5);
        dino.position.set(2, 0, -2);
        scene.add(dino);

        // 如果恐龙有动画
        if (gltf2.animations && gltf2.animations.length > 0) {
          dinoMixer = new THREE.AnimationMixer(dino);
          const action = dinoMixer.clipAction(gltf2.animations[0]);
          action.play();
        }

        // 显示开始按钮
        showStartButton();
      },
      (xhr) => {
        if (xhr.total) {
          const percent = (xhr.loaded / xhr.total) * 100;
          progressBar.style.width = percent + '%';
          progressText.innerText = '加载恐龙 ' + Math.floor(percent) + '%';
        }
      },
      (error) => {
        console.error('恐龙加载失败:', error);
      }
    );
  },
  (xhr) => {
    if (xhr.total) {
      const percent = (xhr.loaded / xhr.total) * 100;
      progressBar.style.width = percent + '%';
      progressText.innerText = '加载Thanos ' + Math.floor(percent) + '%';
    }
  },
  (error) => {
    console.error('Thanos加载失败:', error);
  }
);

// === 开始按钮 ===
function showStartButton() {
  progressContainer.style.transition = 'opacity 1s';
  progressContainer.style.opacity = '0';
  setTimeout(() => progressContainer.remove(), 1000);

  const startBtn = document.createElement('button');
  startBtn.className = 'start-btn';
  startBtn.innerText = '开始体验';
  document.body.appendChild(startBtn);

  startBtn.addEventListener('click', () => {
    startBtn.remove();
    startExperience();
  });
}

// === 音乐 ===
const bgm = new Audio('./Interlinked (Slowed to Perfection).mp3');
bgm.loop = true;
bgm.volume = 0.5;

function startExperience() {
  if (!started) {
    started = true;
    bgm.play().catch(err => console.log("自动播放需要用户交互:", err));
    animate();
  }
}

// === 动画循环 ===
function animate() {
  if (!started) return;
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (thanos) {
    if (keys['w'] || keys['ArrowUp']) thanos.position.z -= speed;
    if (keys['s'] || keys['ArrowDown']) thanos.position.z += speed;
    if (keys['a'] || keys['ArrowLeft']) thanos.position.x -= speed;
    if (keys['d'] || keys['ArrowRight']) thanos.position.x += speed;
  }

  // 恐龙动画
  if (dinoMixer) dinoMixer.update(delta);

  controls.update();
  renderer.render(scene, camera);
}
