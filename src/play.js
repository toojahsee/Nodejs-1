// play.js
import * as THREE from 'three';
import { Box3 } from 'three';
import { updatePlayer } from '@/control.js';
import { uploadScore } from '@/firebase.js';

let obstacles = [];
let meteors = [];
let score = 0;
let gameRunning = false;
let obstacleSpeed = 0.01; // 初始更慢
let meteorActive = false; // 控制是否有陨石正在下落

export function initGameData() {
  obstacles = [];
  meteors = [];
  score = 0;
  obstacleSpeed = 0.01;
  gameRunning = true;
  meteorActive = false;
}

export function animate(scene, camera, dinoData, thanosData, runway, moon, clock, playerState, scoreDiv, renderer) {
  if (!gameRunning) return;

  requestAnimationFrame(() => animate(scene, camera, dinoData, thanosData, runway, moon, clock, playerState, scoreDiv, renderer));

  const delta = clock.getDelta();

  if (dinoData.mixer) dinoData.mixer.update(delta);

  // 玩家移动控制
  updatePlayer(dinoData.model, runway.runwayWidth, delta, playerState, scene);

  // 相机跟随玩家
  if (dinoData.model) {
    camera.position.set(dinoData.model.position.x, dinoData.model.position.y + 5, dinoData.model.position.z - 15);
    camera.lookAt(dinoData.model.position.x, dinoData.model.position.y + 2, dinoData.model.position.z + 20);
    moon.position.set(dinoData.model.position.x, 50, dinoData.model.position.z + 200);
  }

  // === 生成障碍物（频率更低，分数越高越多） ===
  const obstacleProb = 0.005 + score / 40000;
  if (Math.random() < obstacleProb && dinoData.model) {
    spawnObstacle(scene, thanosData.model, dinoData.model.position.z, runway.runwayWidth);
  }

  // === 生成陨石（一次只能有一波） ===
  if (!meteorActive && Math.random() < 0.008 && dinoData.model) {
    spawnMeteorWave(scene, dinoData.model);
  }

  // 更新障碍物
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.mesh.position.z -= obs.speed * delta * 80;
    obs.box.setFromObject(obs.mesh);

    obs.helper.position.copy(obs.mesh.position);

    if (dinoData.model) {
      const playerBox = new Box3().setFromObject(dinoData.model);
      if (obs.box.intersectsBox(playerBox)) {
        gameOver();
        return;
      }
    }

    if (obs.mesh.position.z < dinoData.model.position.z - 50) {
      scene.remove(obs.mesh, obs.helper);
      obstacles.splice(i, 1);
    }
  }

  // 更新陨石（始终追踪玩家）
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    if (dinoData.model) {
      // 计算朝向玩家的方向向量
      const dir = new THREE.Vector3(
        dinoData.model.position.x - m.mesh.position.x,
        0,
        dinoData.model.position.z - m.mesh.position.z
      ).normalize();

      // X/Z 方向不断逼近玩家
      m.mesh.position.x += dir.x * m.speedXZ * delta * 60;
      m.mesh.position.z += dir.z * m.speedXZ * delta * 60;
    }

    // Y 方向持续下降
    m.mesh.position.y -= m.speedY * delta * 60;

    m.box.setFromObject(m.mesh);

    // 🚀 marker 永远在陨石下方
    m.marker.position.set(m.mesh.position.x, 0.05, m.mesh.position.z);

    if (dinoData.model) {
      const playerBox = new Box3().setFromObject(dinoData.model);
      if (m.box.intersectsBox(playerBox)) {
        gameOver();
        return;
      }
    }

    if (m.mesh.position.y < 0) {
      scene.remove(m.mesh, m.marker);
      meteors.splice(i, 1);
    }
  }

  if (meteorActive && meteors.length === 0) {
    meteorActive = false;
  }

  // 分数与难度递增
  score += delta * 10;
  scoreDiv.innerText = "分数: " + Math.floor(score);
  obstacleSpeed = 0.01 + score / 1000;

  if (runway.texture) runway.texture.offset.y -= 0.002;
  moon.rotation.y += 0.01;

  renderer.render(scene, camera);
}

// === 生成障碍物 ===
function spawnObstacle(scene, thanos, playerZ, runwayWidth) {
  const spawnX = (Math.random() - 0.5) * (runwayWidth - 4);
  const spawnZ = playerZ + 150 + Math.random() * 30;

  const clone = thanos.clone();
  clone.position.set(spawnX, 0, spawnZ);

  const speed = obstacleSpeed + Math.random() * 0.0001;
  const box = new Box3().setFromObject(clone);

  const helperGeo = new THREE.BoxGeometry(3, 3, 3);
  const helperMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
  const helper = new THREE.Mesh(helperGeo, helperMat);
  helper.position.copy(clone.position);

  scene.add(clone, helper);
  obstacles.push({ mesh: clone, box, speed, helper });
}

// === 生成一波陨石 ===
function spawnMeteorWave(scene, player) {
  meteorActive = true;

  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const offsetX = (Math.random() - 0.5) * 6;
    const offsetZ = (Math.random() - 0.5) * 6;

    const targetX = player.position.x + offsetX;
    const targetZ = player.position.z + offsetZ + 20;

    // marker
    const markerGeo = new THREE.PlaneGeometry(4, 4);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(targetX, 0.05, targetZ);

    // 陨石
    const geo = new THREE.SphereGeometry(2, 16, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff5500 });
    const meteor = new THREE.Mesh(geo, mat);
    meteor.position.set(targetX, 80 + Math.random() * 20, targetZ);

    const speedY = 0.06 + Math.random() * 0.04;
    const speedXZ = 0.05 + Math.random() * 0.05; // 🚀 新增水平追踪速度
    const box = new Box3().setFromObject(meteor);

    scene.add(meteor, marker);
    meteors.push({ mesh: meteor, box, speedY, speedXZ, marker });
  }
}

// === 游戏结束 ===
async function gameOver() {
  gameRunning = false;
  const playerName = prompt("💀 游戏结束! 输入昵称提交分数:", "玩家");
  if (playerName) await uploadScore(playerName, Math.floor(score));
  location.href = './lobby.html';
}
