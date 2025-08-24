// main.js
import * as THREE from 'three';
import { setupControls, playerState } from './control.js';
import { createSceneObjects } from '@/ground.js';
import { animate, initGameData } from '@/play.js';

// === 动态星空背景 ===
const starScene = new THREE.Scene();
const starCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
starCamera.position.z = 10;

const starRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
starRenderer.setSize(window.innerWidth, window.innerHeight);
starRenderer.domElement.style.position = "fixed";
starRenderer.domElement.style.top = "0";
starRenderer.domElement.style.left = "0";
starRenderer.domElement.style.zIndex = "-1";
document.body.appendChild(starRenderer.domElement);

// 创建星空
const starGeometry = new THREE.BufferGeometry();
const starCount = 2000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 2000;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0x0ff, size: 1 });
const stars = new THREE.Points(starGeometry, starMaterial);
starScene.add(stars);

function animateStars() {
  stars.rotation.y += 0.0005;
  starRenderer.render(starScene, starCamera);
  requestAnimationFrame(animateStars);
}
animateStars();

// === 分数显示 ===
const scoreDiv = document.createElement('div');
scoreDiv.style.position = 'fixed';
scoreDiv.style.top = '20px';
scoreDiv.style.left = '50%';
scoreDiv.style.transform = 'translateX(-50%)';
scoreDiv.style.fontSize = '26px';
scoreDiv.style.padding = '6px 12px';
scoreDiv.style.color = '#0ff';
scoreDiv.style.fontFamily = 'monospace';
scoreDiv.style.fontWeight = 'bold';
scoreDiv.style.background = 'rgba(0,0,0,0.5)';
scoreDiv.style.border = '1px solid #0ff';
scoreDiv.style.borderRadius = '8px';
scoreDiv.style.textShadow = '0 0 10px #0ff, 0 0 20px #00f';
scoreDiv.style.zIndex = '1000';
document.body.appendChild(scoreDiv);

// === 开始按钮 ===
const startBtn = document.createElement('button');
startBtn.innerText = '开始游戏';
startBtn.style.position = 'fixed';
startBtn.style.top = '50%';
startBtn.style.left = '50%';
startBtn.style.transform = 'translate(-50%,-50%) scale(1)';
startBtn.style.fontSize = '30px';
startBtn.style.padding = '20px 50px';
startBtn.style.background = 'rgba(0,0,0,0.7)';
startBtn.style.color = '#0ff';
startBtn.style.border = '2px solid #0ff';
startBtn.style.borderRadius = '20px';
startBtn.style.cursor = 'pointer';
startBtn.style.boxShadow = '0 0 20px #0ff';
startBtn.style.transition = 'all 0.3s ease';
startBtn.style.zIndex = '1000';
document.body.appendChild(startBtn);

// 按钮交互动画
startBtn.addEventListener('mouseover', () => {
  startBtn.style.transform = 'translate(-50%,-50%) scale(1.1)';
  startBtn.style.boxShadow = '0 0 40px #0ff';
});
startBtn.addEventListener('mouseout', () => {
  startBtn.style.transform = 'translate(-50%,-50%) scale(1)';
  startBtn.style.boxShadow = '0 0 20px #0ff';
});
startBtn.addEventListener('mousedown', () => {
  startBtn.style.transform = 'translate(-50%,-50%) scale(0.95)';
});
startBtn.addEventListener('mouseup', () => {
  startBtn.style.transform = 'translate(-50%,-50%) scale(1.1)';
});

// === 背景音乐 ===
const bgm = new Audio('./Interlinked (Slowed to Perfection).mp3');
bgm.loop = true;

// === 点击开始：动态创建场景并启动游戏 ===
startBtn.addEventListener('click', async () => {
  startBtn.remove();
  try { bgm.play(); } catch (e) { console.warn('BGM 未能自动播放，需要用户交互'); }

  const {
    scene, camera, renderer,
    runway,
    moon,
    dinoData,
    thanosData,
    texture
  } = await createSceneObjects();

  setupControls(playerState);

  const clock = new THREE.Clock();
  initGameData();

  const runwayWithTex = { ...runway, texture };

  animate(
    scene,
    camera,
    dinoData,
    thanosData,
    runwayWithTex,
    moon,
    clock,
    playerState,
    scoreDiv,
    renderer
  );
});
