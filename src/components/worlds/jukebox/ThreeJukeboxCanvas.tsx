import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Episode } from '../../../types';
import { audioEngine } from '../../../utils/audioEngine';

interface ThreeJukeboxCanvasProps {
  episodes: Episode[];
  activeEpisode: Episode;
  onSelectEpisode: (ep: Episode) => void;
  isPlaying: boolean;
  currentTime: number;
  onSeek: (seconds: number) => void;
  cameraView: 'overview' | 'turntable' | 'crate';
}

export const ThreeJukeboxCanvas: React.FC<ThreeJukeboxCanvasProps> = ({
  episodes,
  activeEpisode,
  onSelectEpisode,
  isPlaying,
  currentTime,
  onSeek,
  cameraView,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredRecordIndex, setHoveredRecordIndex] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  // References to keep across renders for Three.js scene loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // 3D Objects refs
  const platterGroupRef = useRef<THREE.Group | null>(null);
  const tonearmGroupRef = useRef<THREE.Group | null>(null);
  const tonearmArmRef = useRef<THREE.Group | null>(null);
  const recordOnPlatterRef = useRef<THREE.Group | null>(null);
  const crateRecordsRef = useRef<{ group: THREE.Group; episode: Episode; index: number }[]>([]);
  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 11, 16));
  const targetCameraLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // State machine for record transition animation
  const transitionState = useRef<{
    animating: boolean;
    progress: number;
    sourceIndex: number;
    targetEpisode: Episode | null;
  }>({
    animating: false,
    progress: 0,
    sourceIndex: 0,
    targetEpisode: null,
  });

  // Helper to generate vinyl label texture using 2D Canvas
  const createVinylLabelTexture = (episode: Episode) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Background circle
    ctx.fillStyle = episode.themeColor.vinylLabel || '#1a1a1a';
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();

    // Subtle concentric ring
    ctx.strokeStyle = '#ffffff22';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 256, 230, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(256, 256, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Spindle hole
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(256, 256, 28, 0, Math.PI * 2);
    ctx.fill();

    // Text: Brand and Episode Info
    ctx.fillStyle = '#f5f5f5';
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('MANGO MAGIC', 256, 175);

    ctx.font = '600 20px monospace';
    ctx.fillStyle = '#ffffffbb';
    ctx.fillText(`EP. 0${episode.episodeNumber}`, 256, 205);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    const guestShort = episode.guestName.toUpperCase();
    ctx.fillText(guestShort, 256, 320);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffffff99';
    ctx.fillText('33 ⅓ RPM · HIGH FIDELITY', 256, 350);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  };

  // Helper to generate sleeve artwork texture
  const createSleeveTexture = (episode: Episode) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich gradient background based on theme
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#161618');
    grad.addColorStop(0.5, episode.themeColor.bgGlow.replace('0.15', '0.4').replace('0.2', '0.5') || '#222');
    grad.addColorStop(1, '#0c0c0e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Spine and border line
    ctx.strokeStyle = '#ffffff25';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 480, 480);

    // Title & Typography
    ctx.fillStyle = episode.themeColor.accent || '#f59e0b';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(`VOL. 0${episode.episodeNumber}`, 44, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px serif';
    const words = episode.guestName.split(' ');
    ctx.fillText(words[0] || '', 44, 140);
    if (words[1]) ctx.fillText(words.slice(1).join(' '), 44, 182);

    ctx.fillStyle = '#ffffffaa';
    ctx.font = '18px sans-serif';
    ctx.fillText(episode.guestRole.substring(0, 32), 44, 220);

    // Graphic geometric stamp
    ctx.strokeStyle = episode.themeColor.accent || '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(380, 380, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MM', 380, 375);
    ctx.font = '12px monospace';
    ctx.fillText('ANALOG', 380, 395);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Helper to generate realistic vinyl groove normal / bump texture
  const createVinylGrooveTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    const center = 256;
    for (let r = 70; r < 245; r += 1.5) {
      const alpha = 0.15 + (Math.sin(r * 4) * 0.1);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Lead-out runout grooves
    for (let r = 50; r < 70; r += 4) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Switch camera views based on prop
  useEffect(() => {
    if (cameraView === 'overview') {
      targetCameraPos.current.set(0, 12, 17);
      targetCameraLookAt.current.set(0, 0, 0);
    } else if (cameraView === 'turntable') {
      targetCameraPos.current.set(3.5, 9, 8);
      targetCameraLookAt.current.set(3.5, 1, 0);
    } else if (cameraView === 'crate') {
      targetCameraPos.current.set(-4.5, 8.5, 7);
      targetCameraLookAt.current.set(-4.5, 0.5, 0);
    }
  }, [cameraView]);

  // Handle Episode Selection with 3D animation
  const triggerSelectEpisode = useCallback((targetEp: Episode) => {
    if (targetEp.id === activeEpisode.id && !transitionState.current.animating) {
      // Toggle play
      audioEngine.togglePlay();
      return;
    }

    const targetIdx = episodes.findIndex((e) => e.id === targetEp.id);
    transitionState.current = {
      animating: true,
      progress: 0,
      sourceIndex: targetIdx >= 0 ? targetIdx : 0,
      targetEpisode: targetEp,
    };

    audioEngine.triggerHapticClick(0.12);
    audioEngine.playNeedleDrop();
    onSelectEpisode(targetEp);
  }, [activeEpisode.id, episodes, onSelectEpisode]);

  // Main Three.js Setup and Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060608);
    scene.fog = new THREE.FogExp2(0x060608, 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 12, 17);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Key Light (Cast dramatic warm studio shadow)
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.8);
    keyLight.position.set(8, 16, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 35;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Cyan Rim Light (High-end metallic reflection)
    const rimLight = new THREE.DirectionalLight(0x70d6ff, 1.4);
    rimLight.position.set(-12, 8, -6);
    scene.add(rimLight);

    // Turntable Spotlight (Focused down onto vinyl grooves)
    const spotLight = new THREE.SpotLight(0xffd166, 3.5, 25, Math.PI / 5, 0.4, 1.5);
    spotLight.position.set(3.5, 12, 2);
    spotLight.target.position.set(3.5, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // 5. Studio Surface (Heavy matte dark slate tabletop)
    const tableGeo = new THREE.BoxGeometry(32, 1, 20);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c0f,
      roughness: 0.85,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.5;
    table.receiveShadow = true;
    scene.add(table);

    // ==========================================
    // 6. BUILD THE 3D TURNTABLE (Right Side)
    // ==========================================
    const turntableX = 3.6;
    const turntableZ = 0;
    const turntableGroup = new THREE.Group();
    turntableGroup.position.set(turntableX, 0, turntableZ);

    // Turntable Plinth / Chassis (Brushed anodized aluminium with chamfered edge)
    const plinthGeo = new THREE.BoxGeometry(8.2, 0.7, 7.2);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      metalness: 0.85,
      roughness: 0.25,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.35;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    turntableGroup.add(plinth);

    // Turntable Feet (Solid machined brass/rubber isolators)
    const footGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
    const footMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.3 });
    [[-3.6, -3.1], [3.6, -3.1], [-3.6, 3.1], [3.6, 3.1]].forEach(([fx, fz]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, 0.1, fz);
      turntableGroup.add(foot);
    });

    // Recessed Platter Well
    const wellGeo = new THREE.CylinderGeometry(2.9, 2.9, 0.15, 48);
    const wellMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.9 });
    const well = new THREE.Mesh(wellGeo, wellMat);
    well.position.set(-0.8, 0.71, 0);
    turntableGroup.add(well);

    // Revolving Platter Group
    const platterGroup = new THREE.Group();
    platterGroup.position.set(-0.8, 0.78, 0);
    platterGroupRef.current = platterGroup;
    turntableGroup.add(platterGroup);

    // Machined aluminium platter rim with strobe dots
    const platterRimGeo = new THREE.CylinderGeometry(2.75, 2.75, 0.25, 64);
    const platterRimMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.95,
      roughness: 0.15,
    });
    const platterRim = new THREE.Mesh(platterRimGeo, platterRimMat);
    platterRim.castShadow = true;
    platterGroup.add(platterRim);

    // Rubber Slipmat
    const slipmatGeo = new THREE.CylinderGeometry(2.65, 2.65, 0.03, 48);
    const slipmatMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.95 });
    const slipmat = new THREE.Mesh(slipmatGeo, slipmatMat);
    slipmat.position.y = 0.14;
    platterGroup.add(slipmat);

    // Spindle (Center Chrome Pin)
    const spindleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 16);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0, roughness: 0.05 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.position.y = 0.35;
    platterGroup.add(spindle);

    // Active Vinyl Record Object on the Platter
    const grooveTexture = createVinylGrooveTexture();
    const activeVinylGroup = new THREE.Group();
    activeVinylGroup.position.y = 0.16;
    recordOnPlatterRef.current = activeVinylGroup;
    platterGroup.add(activeVinylGroup);

    // Vinyl Disc Geometry (Outer black PVC vinyl)
    const vinylDiscGeo = new THREE.CylinderGeometry(2.6, 2.6, 0.02, 64);
    const vinylDiscMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      metalness: 0.6,
      roughness: 0.22,
      bumpMap: grooveTexture,
      bumpScale: 0.03,
    });
    const vinylDisc = new THREE.Mesh(vinylDiscGeo, vinylDiscMat);
    vinylDisc.castShadow = true;
    activeVinylGroup.add(vinylDisc);

    // Vinyl Center Label with dynamically created canvas texture
    const initialLabelTex = createVinylLabelTexture(activeEpisode);
    const labelGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.025, 48);
    const labelMat = new THREE.MeshStandardMaterial({
      map: initialLabelTex,
      roughness: 0.4,
    });
    const vinylLabel = new THREE.Mesh(labelGeo, labelMat);
    vinylLabel.position.y = 0.005;
    activeVinylGroup.add(vinylLabel);

    // ==========================================
    // 7. BUILD THE 3D TONEARM ASSEMBLY
    // ==========================================
    const tonearmGroup = new THREE.Group();
    tonearmGroup.position.set(2.4, 0.75, -2.1);
    tonearmGroupRef.current = tonearmGroup;
    turntableGroup.add(tonearmGroup);

    // Base Gimbal Column
    const gimbalBaseGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.6, 24);
    const gimbalBaseMat = new THREE.MeshStandardMaterial({ color: 0x242428, metalness: 0.9, roughness: 0.2 });
    const gimbalBase = new THREE.Mesh(gimbalBaseGeo, gimbalBaseMat);
    gimbalBase.position.y = 0.3;
    tonearmGroup.add(gimbalBase);

    // Tonearm Arm Rotating Pivot (Rotates around Y to move across record)
    const tonearmArm = new THREE.Group();
    tonearmArm.position.y = 0.6;
    tonearmArmRef.current = tonearmArm;
    tonearmGroup.add(tonearmArm);

    // Counterweight (Stainless steel ring at back)
    const counterweightGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.4, 24);
    const counterweightMat = new THREE.MeshStandardMaterial({ color: 0x888890, metalness: 0.95, roughness: 0.15 });
    const counterweight = new THREE.Mesh(counterweightGeo, counterweightMat);
    counterweight.rotation.z = Math.PI / 2;
    counterweight.position.set(0, 0, -0.6);
    tonearmArm.add(counterweight);

    // S-Shaped or Straight Machined Wand
    const wandGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.8, 16);
    const wandMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.1 });
    const wand = new THREE.Mesh(wandGeo, wandMat);
    wand.rotation.x = Math.PI / 2;
    wand.position.set(0, 0, 1.4);
    tonearmArm.add(wand);

    // Cartridge and Headshell (Angled at the end)
    const headshellGeo = new THREE.BoxGeometry(0.18, 0.12, 0.45);
    const headshellMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.3, metalness: 0.5 });
    const headshell = new THREE.Mesh(headshellGeo, headshellMat);
    headshell.position.set(0, -0.05, 3.4);
    headshell.rotation.y = -0.22;
    tonearmArm.add(headshell);

    // Stylus Needle
    const needleGeo = new THREE.ConeGeometry(0.02, 0.08, 8);
    const needleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.set(0, -0.1, 3.45);
    needle.rotation.x = Math.PI;
    tonearmArm.add(needle);

    // Power / 33-45 RPM Switch Knobs on turntable
    const switchGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16);
    const switchMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.15 });
    const powerSwitch = new THREE.Mesh(switchGeo, switchMat);
    powerSwitch.position.set(-3.2, 0.76, 2.6);
    turntableGroup.add(powerSwitch);

    scene.add(turntableGroup);

    // ==========================================
    // 8. BUILD THE 3D CRATE OF RECORDS (Left Side)
    // ==========================================
    const crateX = -4.5;
    const crateZ = 0.2;
    const crateGroup = new THREE.Group();
    crateGroup.position.set(crateX, 0, crateZ);

    // Crate Box Walls (Warm natural smoked oak wood)
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x1b1b20,
      roughness: 0.7,
      metalness: 0.05,
    });

    // Base of crate
    const crateBottom = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.2, 6.4), woodMat);
    crateBottom.position.y = 0.1;
    crateBottom.receiveShadow = true;
    crateGroup.add(crateBottom);

    // Back wall
    const crateBack = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.6, 0.2), woodMat);
    crateBack.position.set(0, 1.8, -3.1);
    crateGroup.add(crateBack);

    // Front low lip
    const crateFront = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.2, 0.2), woodMat);
    crateFront.position.set(0, 0.6, 3.1);
    crateGroup.add(crateFront);

    // Left and right side panels with cut-out handles
    const crateLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 6.4), woodMat);
    crateLeft.position.set(-3.1, 1.4, 0);
    crateGroup.add(crateLeft);

    const crateRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 6.4), woodMat);
    crateRight.position.set(3.1, 1.4, 0);
    crateGroup.add(crateRight);

    // Crate Records Array
    crateRecordsRef.current = [];
    const recordSpacing = 0.9;
    const startZ = 1.6;

    episodes.forEach((ep, idx) => {
      const recGroup = new THREE.Group();
      recGroup.position.set(0, 0.2, startZ - (idx * recordSpacing));
      recGroup.rotation.x = 0.15; // Slanted backward inside crate
      recGroup.userData = { episode: ep, index: idx };

      // Sleeve Mesh
      const sleeveTex = createSleeveTexture(ep);
      const sleeveGeo = new THREE.BoxGeometry(5.2, 5.2, 0.08);
      const sleeveMat = new THREE.MeshStandardMaterial({
        map: sleeveTex,
        roughness: 0.5,
        metalness: 0.1,
      });
      const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat);
      sleeveMesh.position.y = 2.6;
      sleeveMesh.castShadow = true;
      sleeveMesh.receiveShadow = true;
      recGroup.add(sleeveMesh);

      // Vinyl Peek-out disc (peeks out slightly from the top-right of sleeve)
      const peekDiscGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.02, 32);
      const peekDisc = new THREE.Mesh(peekDiscGeo, vinylDiscMat);
      peekDisc.rotation.x = Math.PI / 2;
      peekDisc.position.set(0.6, 3.0, -0.02);
      recGroup.add(peekDisc);

      crateGroup.add(recGroup);
      crateRecordsRef.current.push({ group: recGroup, episode: ep, index: idx });
    });

    scene.add(crateGroup);

    // ==========================================
    // 9. RAYCASTING INTERACTION (Clicks & Hovers)
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersect with crate records
      const intersectableSleeves = crateRecordsRef.current.map((r) => r.group.children[0]);
      const intersects = raycaster.intersectObjects(intersectableSleeves);

      if (intersects.length > 0) {
        const hitGroup = intersects[0].object.parent;
        const hitData = crateRecordsRef.current.find((r) => r.group === hitGroup);
        if (hitData) {
          setHoveredRecordIndex(hitData.index);
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }

      // Check intersect with Turntable Platter / Vinyl
      const platterIntersects = raycaster.intersectObject(vinylDisc);
      if (platterIntersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        setHoveredRecordIndex(null);
        return;
      }

      renderer.domElement.style.cursor = 'default';
      setHoveredRecordIndex(null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // 1. Check click on Crate Records
      const intersectableSleeves = crateRecordsRef.current.map((r) => r.group.children[0]);
      const crateIntersects = raycaster.intersectObjects(intersectableSleeves);
      if (crateIntersects.length > 0) {
        const hitGroup = crateIntersects[0].object.parent;
        const hitData = crateRecordsRef.current.find((r) => r.group === hitGroup);
        if (hitData) {
          triggerSelectEpisode(hitData.episode);
          return;
        }
      }

      // 2. Check click on Vinyl Platter to seek
      const platterIntersects = raycaster.intersectObject(vinylDisc);
      if (platterIntersects.length > 0) {
        const hitPoint = platterIntersects[0].point;
        // Calculate distance from platter center (X: 2.8, Z: 0 in world coords)
        const centerWorld = new THREE.Vector3();
        platterGroup.getWorldPosition(centerWorld);
        const dist = Math.hypot(hitPoint.x - centerWorld.x, hitPoint.z - centerWorld.z);

        // Normalize distance (from radius 0.7 to 2.5) to progress 0 to 1
        const progress = Math.max(0, Math.min(1, (2.5 - dist) / 1.8));
        const seekTarget = progress * activeEpisode.durationSeconds;
        onSeek(seekTarget);
        audioEngine.triggerHapticClick(0.08);
        return;
      }

      // 3. Check click on Plinth or Tonearm to toggle playback
      const tonearmIntersects = raycaster.intersectObjects([plinth, wand, headshell]);
      if (tonearmIntersects.length > 0) {
        audioEngine.togglePlay();
        audioEngine.triggerHapticClick(0.1);
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('click', handleClick);

    // ==========================================
    // 10. ANIMATION / TICK LOOP
    // ==========================================
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth Camera LERP to Target Position and LookAt
      camera.position.lerp(targetCameraPos.current, 0.06);
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      // smoothly reorient camera towards target
      camera.lookAt(targetCameraLookAt.current);

      // Platter Rotation (Only if playing or finishing spin)
      if (platterGroupRef.current) {
        if (isPlaying) {
          platterGroupRef.current.rotation.y += delta * 3.49; // ~33 1/3 RPM in rad/s
        }
      }

      // Tonearm Tracking Logic
      if (tonearmArmRef.current) {
        const targetArmAngle = isPlaying
          ? 0.35 + (currentTime / (activeEpisode.durationSeconds || 3000)) * 0.38 // sweeps over platter
          : -0.15; // resting at rest cradle

        tonearmArmRef.current.rotation.y = THREE.MathUtils.lerp(
          tonearmArmRef.current.rotation.y,
          targetArmAngle,
          isPlaying ? 0.03 : 0.08
        );

        // Needle lift/drop height
        const targetHeight = isPlaying ? 0.58 : 0.65;
        tonearmArmRef.current.position.y = THREE.MathUtils.lerp(
          tonearmArmRef.current.position.y,
          targetHeight,
          0.05
        );
      }

      // Record Slant and Lift in Crate based on hover
      crateRecordsRef.current.forEach((rec, i) => {
        const isHovered = hoveredRecordIndex === i;
        const targetLift = isHovered ? 0.8 : 0.2;
        const targetSlant = isHovered ? 0.02 : 0.15;

        rec.group.position.y = THREE.MathUtils.lerp(rec.group.position.y, targetLift, 0.1);
        rec.group.rotation.x = THREE.MathUtils.lerp(rec.group.rotation.x, targetSlant, 0.1);
      });

      // Handle Record Transition Animation (Record flying from crate onto platter)
      if (transitionState.current.animating && recordOnPlatterRef.current) {
        transitionState.current.progress += delta * 1.8;
        const p = transitionState.current.progress;

        if (p < 1) {
          // Arc animation: fly up and across
          const arcHeight = Math.sin(p * Math.PI) * 2.5;
          recordOnPlatterRef.current.position.y = 0.16 + arcHeight;
          recordOnPlatterRef.current.rotation.y = p * Math.PI * 4;
        } else {
          // Complete
          transitionState.current.animating = false;
          recordOnPlatterRef.current.position.y = 0.16;
          recordOnPlatterRef.current.rotation.y = 0;

          // Update label texture to new episode
          if (transitionState.current.targetEpisode) {
            const newLabelTex = createVinylLabelTexture(transitionState.current.targetEpisode);
            vinylLabel.material = new THREE.MeshStandardMaterial({
              map: newLabelTex,
              roughness: 0.4,
            });
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 560;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [episodes, triggerSelectEpisode, onSeek]);

  // Update label texture if activeEpisode changes externally
  useEffect(() => {
    if (recordOnPlatterRef.current) {
      const labelMesh = recordOnPlatterRef.current.children[1] as THREE.Mesh;
      if (labelMesh && labelMesh.material) {
        const newTex = createVinylLabelTexture(activeEpisode);
        labelMesh.material = new THREE.MeshStandardMaterial({
          map: newTex,
          roughness: 0.4,
        });
      }
    }
  }, [activeEpisode]);

  return (
    <div className="relative w-full h-[540px] md:h-[640px] overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800/80 shadow-2xl select-none">
      {/* 3D WebGL Canvas mount container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Spatial Micro-HUD & Direct Action Indicators */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1.5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-neutral-300">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-amber-400 animate-ping' : 'bg-neutral-600'}`} />
          <span>{isPlaying ? 'PLATTER REVOLVING · 33 ⅓ RPM' : 'MOTOR ARMED · SELECT VINYL'}</span>
        </div>
        <div className="text-[11px] font-mono text-neutral-400 pl-1">
          CLICK CRATE TO LOAD · CLICK VINYL GROOVE TO SEEK
        </div>
      </div>

      {/* Active Record Hologram Card in bottom corner */}
      <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 z-20 p-4 rounded-xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-neutral-800 flex items-center justify-center">
          <img
            src={activeEpisode.coverImage}
            alt={activeEpisode.guestName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
            LOADED ON PLATTER · EP. {activeEpisode.episodeNumber}
          </div>
          <div className="text-sm font-semibold text-white truncate font-display">
            {activeEpisode.guestName}
          </div>
          <div className="text-xs text-neutral-400 truncate">
            {activeEpisode.title}
          </div>
        </div>
        <button
          id="canvas-quick-play-toggle"
          onClick={() => audioEngine.togglePlay()}
          className="p-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold transition-transform active:scale-95 shadow-lg cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
