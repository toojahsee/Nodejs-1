import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3Helper } from 'three';

// === 场景 ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// === 相机 ===
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 5, -15);

// === 渲染器 ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

// === 监听窗口变化 ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === 光照 ===
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// === 跑道 ===
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

// === 月亮 ===
const moonTexture = new THREE.TextureLoader().load("./666.jpg");
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(15, 64, 64),
  new THREE.MeshStandardMaterial({ map: moonTexture })
);
moon.position.set(0, 50, 200);
scene.add(moon);

// === 游戏变量 ===
let dino, thanos, dinoMixer;
const clock = new THREE.Clock();
let isJumping = false;
let jumpVelocity = 0;
const gravity = -0.01;
const jumpStrength = 0.25;
const groundY = 0;
const obstacles = [];
let obstacleSpeed = 0.1;
let spawnTimer = 0;
let score = 0;
let gameRunning = false;

// === 分数显示 ===
const scoreDiv = document.createElement('div');
scoreDiv.style.position = 'fixed';
scoreDiv.style.top = '20px';
scoreDiv.style.left = '50%';
scoreDiv.style.transform = 'translateX(-50%)';
scoreDiv.style.fontSize = '24px';
scoreDiv.style.color = '#0ff';
scoreDiv.style.fontFamily = 'monospace';
scoreDiv.style.textShadow = '0 0 10px #0ff';
document.body.appendChild(scoreDiv);

// === 加载提示 ===
const loadingDiv = document.createElement('div');
loadingDiv.innerText = "加载中...";
loadingDiv.style.position = "fixed";
loadingDiv.style.top = "50%";
loadingDiv.style.left = "50%";
loadingDiv.style.transform = "translate(-50%, -50%)";
loadingDiv.style.color = "#fff";
loadingDiv.style.fontSize = "28px";
document.body.appendChild(loadingDiv);

// === 开始游戏按钮 ===
const startBtn = document.createElement('button');
startBtn.innerText = "开始游戏";
startBtn.style.position = "fixed";
startBtn.style.top = "50%";
startBtn.style.left = "50%";
startBtn.style.transform = "translate(-50%, -50%)";
startBtn.style.fontSize = "28px";
startBtn.style.padding = "20px 40px";
startBtn.style.background = "rgba(0,0,0,0.7)";
startBtn.style.color = "#0ff";
startBtn.style.border = "2px solid #0ff";
startBtn.style.borderRadius = "15px";
startBtn.style.display = "none";
document.body.appendChild(startBtn);

// === 背景音乐 ===
const bgm = new Audio("./Interlinked (Slowed to Perfection).mp3");
bgm.loop = true;

// === GLTFLoader ===
const loader = new GLTFLoader();
let dinoLoaded = false, thanosLoaded = false;

// 玩家恐龙
loader.load('./scene2.gltf', (gltf) => {
  dino = gltf.scene;
  dino.scale.set(1.5, 1.5, 1.5);
  dino.position.set(0, groundY, 2);
  scene.add(dino);

  if (gltf.animations && gltf.animations.length > 0) {
    dinoMixer = new THREE.AnimationMixer(dino);
    dinoMixer.clipAction(gltf.animations[0]).play();
  }

  dinoLoaded = true;
  checkStart();
});

// Thanos 模型
loader.load('./thanos.gltf', (gltf) => {
  thanos = gltf.scene;
  thanos.scale.set(0.15, 0.15, 0.15);
  thanosLoaded = true;
  checkStart();
});

function checkStart() {
  if (dinoLoaded && thanosLoaded) {
    loadingDiv.remove();
    startBtn.style.display = "block";
  }
}

// 点击开始
startBtn.addEventListener("click", () => {
  startBtn.remove();
  bgm.play();  // 用户点击时触发音乐
  gameRunning = true;
  animate();
});

// === 按键状态管理 ===
const keys = { ArrowLeft:false, ArrowRight:false, KeyA:false, KeyD:false, Space:false, ArrowUp:false };
window.addEventListener('keydown', e => { if(keys.hasOwnProperty(e.code)) keys[e.code] = true; });
window.addEventListener('keyup', e => { if(keys.hasOwnProperty(e.code)) keys[e.code] = false; });

// === 手机端按钮 ===
function createButton(text, left, bottom, code){
  const btn = document.createElement('button');
  btn.innerText = text;
  btn.style.position = 'fixed';
  btn.style.left = left;
  btn.style.bottom = bottom;
  btn.style.width = '60px';
  btn.style.height = '60px';
  btn.style.fontSize = '24px';
  btn.style.borderRadius = '50%';
  btn.style.background = 'rgba(0,0,0,0.5)';
  btn.style.color = '#0ff';
  btn.style.border = '2px solid #0ff';
  btn.style.userSelect = 'none';
  btn.style.webkitUserSelect = 'none';
  btn.style.outline = 'none';
  btn.style.webkitTapHighlightColor = 'transparent';
  document.body.appendChild(btn);

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys[code] = true;
  }, {passive:false});
  btn.addEventListener('touchend', () => { keys[code] = false; });

  return btn;
}
createButton('◀', '20px', '80px', 'ArrowRight');
createButton('▶', '100px', '80px', 'ArrowLeft');
createButton('⤴', '85%', '80px', 'Space');

// === 双指缩放 ===
let touchDistance = 0;
window.addEventListener('touchstart', (e)=>{
  if(e.touches.length === 2){
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    touchDistance = Math.sqrt(dx*dx + dy*dy);
  }
}, {passive:true});
window.addEventListener('touchmove', (e)=>{
  if(e.touches.length === 2){
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const newDist = Math.sqrt(dx*dx + dy*dy);
    const diff = newDist - touchDistance;
    if(Math.abs(diff) > 5){
      if(diff > 0){
        camera.fov = Math.max(40, camera.fov - 1);
      } else {
        camera.fov = Math.min(100, camera.fov + 1);
      }
      camera.updateProjectionMatrix();
      touchDistance = newDist;
    }
  }
}, {passive:true});

// === 玩家更新 ===
function updatePlayer(delta) {
  if (!dino) return;
  let moveX = 0;
  if (keys.ArrowLeft || keys.KeyA) moveX -= 0.4;
  if (keys.ArrowRight || keys.KeyD) moveX += 0.4;
  dino.position.x += moveX;
  const halfWidth = runwayWidth / 2 - 0.5;
  dino.position.x = Math.max(-halfWidth, Math.min(halfWidth, dino.position.x));

  if ((keys.Space || keys.ArrowUp) && !isJumping) {
    isJumping = true;
    jumpVelocity = jumpStrength;
  }
  if (isJumping) {
    dino.position.y += jumpVelocity;
    jumpVelocity += gravity;
    if (dino.position.y <= groundY) {
      dino.position.y = groundY;
      isJumping = false;
    }
  }
}

// === 生成障碍物 ===
function spawnObstacle() {
  if (!thanos || !dino) return;
  const laneX = (Math.random() - 0.5) * (runwayWidth - 5);
  const clone = thanos.clone();
  const spawnZ = dino.position.z + 120 + Math.random() * 50;
  clone.position.set(laneX, groundY, spawnZ);

  const dir = Math.random() < 0.5 ? -1 : 1;
  const speed = 0.02 + Math.random() * 0.03;
  const box = new THREE.Box3().setFromObject(clone);
  const helper = new Box3Helper(box, 0xff0000);
  scene.add(clone, helper);
  obstacles.push({ mesh: clone, box, helper, dir, speed });
}

// === 碰撞检测 ===
function checkCollision(dino, obstacle) {
  const dinoBox = new THREE.Box3().setFromObject(dino);
  return dinoBox.intersectsBox(obstacle.box);
}

// === 动画循环 ===
function animate() {
  if (!gameRunning) return;
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (dinoMixer) dinoMixer.update(delta);
  updatePlayer(delta);

  const forwardSpeed = obstacleSpeed * 15;
  if(dino){
    dino.position.z += forwardSpeed * delta;
    camera.position.set(dino.position.x, dino.position.y + 5, dino.position.z - 15);
    camera.lookAt(dino.position.x, dino.position.y + 2, dino.position.z);
    moon.position.set(dino.position.x, 50, dino.position.z + 200);
  }

  if(dino){
    if(dino.position.z - runway1.position.z > runwayLength) runway1.position.z += runwayLength*2;
    if(dino.position.z - runway2.position.z > runwayLength) runway2.position.z += runwayLength*2;
  }

  spawnTimer += delta;
  if(spawnTimer > 2.5){ spawnObstacle(); spawnTimer = 0; }

  for(let i=obstacles.length-1; i>=0; i--){
    const obs = obstacles[i];
    obs.mesh.position.x += obs.dir * obs.speed * delta*60;
    if(Math.abs(obs.mesh.position.x) > runwayWidth/2 -2) obs.dir*=-1;
    obs.box.setFromObject(obs.mesh);
    obs.helper.updateMatrixWorld(true);

    if(dino && checkCollision(dino, obs)){
      alert("游戏结束! 得分: " + Math.floor(score));
      location.reload();
    }
    if(obs.mesh.position.z < dino.position.z -10){
      scene.remove(obs.mesh);
      scene.remove(obs.helper);
      obstacles.splice(i,1);
    }
  }

  score += delta*10;
  scoreDiv.innerText = "分数: " + Math.floor(score);
  obstacleSpeed = 0.1 + score/500;
  texture.offset.y -= forwardSpeed*delta*0.05;
  moon.rotation.y += 0.05;
  renderer.render(scene, camera);
}
