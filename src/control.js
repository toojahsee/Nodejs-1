// ==============================
// control.js
// 玩家控制模块（支持键盘 + 触屏 + 扩展功能）
// ==============================

import * as THREE from 'three';

// 按键状态表
export const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
  KeyA: false,
  KeyD: false,
  KeyW: false,
  KeyS: false,
  Space: false,
  ShiftLeft: false,
  ShiftRight: false
};

// 玩家物理状态
export const playerState = {
  isJumping: false,
  jumpVelocity: 0,
  groundY: 0,
  jumpStrength: 0.5,
  gravity: -0.015,

  moveSpeed: 0.30,        // 基础左右速度
  verticalSpeed: 0.3,     // 基础上下速度
  sprintMultiplier: 1.8,  // 冲刺倍率
  friction: 0.6,          // 移动阻力（惯性效果）

  velocityX: 0,           // 当前横向速度
  velocityZ: 0,           // 当前纵向速度

  minZ: -70.0,             // 允许前后移动的 Z 最小值
  maxZ: 70.0,              // 允许前后移动的 Z 最大值
};

// ==============================
// 控制器绑定
// ==============================
export function setupControls(state = playerState) {
  // 键盘事件
  window.addEventListener('keydown', e => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
  });
  window.addEventListener('keyup', e => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
  });

  // 创建触屏按钮
  function createButton(text, left, bottom, code) {
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
    btn.style.zIndex = '1000';
    document.body.appendChild(btn);

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      keys[code] = true;
    }, { passive: false });

    btn.addEventListener('touchend', () => {
      keys[code] = false;
    });
  }

  // 布局触控按钮
  createButton('◀', '20px', '100px', 'ArrowLeft');
  createButton('▶', '100px', '100px', 'ArrowRight');
  createButton('▲', '60px', '160px', 'ArrowUp');
  createButton('▼', '60px', '40px', 'ArrowDown');
  createButton('⤴', '85%', '100px', 'Space');
  createButton('⚡', '75%', '180px', 'ShiftLeft'); // 冲刺按钮
}

// ==============================
// 玩家移动与跳跃逻辑
// ==============================
export function updatePlayer(dino, runwayWidth, delta, state = playerState, scene = null) {
  if (!dino) return;

  // 是否冲刺
  const isSprinting = keys.ShiftLeft || keys.ShiftRight;
  const speedFactor = isSprinting ? state.sprintMultiplier : 1;

  // 横向移动
  if (keys.ArrowRight || keys.KeyA) state.velocityX -= state.moveSpeed * speedFactor;
  if (keys.ArrowLeft || keys.KeyD) state.velocityX += state.moveSpeed * speedFactor;

  // 前后移动 (Z轴)
  if (keys.ArrowDown || keys.KeyW) state.velocityZ -= state.verticalSpeed * speedFactor;
  if (keys.ArrowUp || keys.KeyS) state.velocityZ += state.verticalSpeed * speedFactor;

  // 应用速度
  dino.position.x += state.velocityX;
  dino.position.z += state.velocityZ;

  // 边界限制
  const halfWidth = runwayWidth / 2 - 0.5;
  dino.position.x = Math.max(-halfWidth, Math.min(halfWidth, dino.position.x));
  dino.position.z = Math.max(state.minZ, Math.min(state.maxZ, dino.position.z));

  // 添加惯性阻力
  state.velocityX *= state.friction;
  state.velocityZ *= state.friction;

  // 跳跃逻辑
  if (keys.Space && !state.isJumping) {
    state.isJumping = true;
    state.jumpVelocity = state.jumpStrength;

    // 粒子特效 (跳跃尘土)
    if (scene) spawnJumpParticles(dino.position, scene);
  }

  if (state.isJumping) {
    dino.position.y += state.jumpVelocity;
    state.jumpVelocity += state.gravity;
    if (dino.position.y <= state.groundY) {
      dino.position.y = state.groundY;
      state.isJumping = false;
    }
  }

  // 玩家倾斜效果
  dino.rotation.z = -state.velocityX * 0.8; // 左右倾斜
  dino.rotation.x = state.velocityZ * 0.5;  // 前后微倾

  // 冲刺特效
  if (isSprinting && scene) spawnSprintParticles(dino.position, scene);
}

// ==============================
// 特效系统
// ==============================
function spawnJumpParticles(position, scene) {
  const geo = new THREE.SphereGeometry(0.1, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(geo, mat.clone());
    p.position.copy(position);
    p.position.y = 0.1;
    const dir = new THREE.Vector3((Math.random()-0.5)*0.5, Math.random()*0.5, (Math.random()-0.5)*0.5);
    scene.add(p);
    setTimeout(()=>scene.remove(p), 300);
    p.position.add(dir);
  }
}

function spawnSprintParticles(position, scene) {
  const geo = new THREE.BoxGeometry(0.1,0.1,0.1);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const p = new THREE.Mesh(geo, mat);
  p.position.copy(position);
  p.position.y += 0.5;
  scene.add(p);
  setTimeout(()=>scene.remove(p), 200);
}

// ==============================
// 调试 HUD (显示状态)
// ==============================
export function setupHUD(state = playerState) {
  const hud = document.createElement('div');
  hud.style.position = 'fixed';
  hud.style.top = '10px';
  hud.style.right = '10px';
  hud.style.padding = '10px';
  hud.style.fontSize = '14px';
  hud.style.color = '#0ff';
  hud.style.fontFamily = 'monospace';
  hud.style.background = 'rgba(0,0,0,0.5)';
  hud.style.border = '1px solid #0ff';
  hud.style.zIndex = '1000';
  document.body.appendChild(hud);

  setInterval(() => {
    hud.innerText =
      `X:${state.velocityX.toFixed(2)} ` +
      `Z:${state.velocityZ.toFixed(2)} ` +
      `Jump:${state.isJumping} `;
  }, 100);
}
