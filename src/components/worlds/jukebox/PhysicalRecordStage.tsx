import { useEffect, useRef } from 'react';
import { collectionPose } from './collectionPose';
import type { FC } from 'react';
import type { MotionValue } from 'motion/react';
import * as THREE from 'three';
import type { Episode } from '../../../types';
import { createRecordArtwork, createSurface } from './recordTextures';

interface Props {
  episode: Episode;
  playing: boolean;
  position: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  rotateY: MotionValue<number>;
  rotateZ: MotionValue<number>;
  exposure: MotionValue<number>;
  opacity: MotionValue<number>;
  width: number;
  height: number;
  baseSize: number;
  landing: { x: number; y: number; scale: number };
  onUnavailable: () => void;
}

const clamp = (value: number): number => Math.max(0, Math.min(1, value));
const smooth = (value: number): number => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = THREE.MathUtils.lerp;
const radians = THREE.MathUtils.degToRad;

function roundedBox(w: number, h: number, depth: number, radius: number): THREE.ExtrudeGeometry {
  const x = -w / 2, y = -h / 2, shape = new THREE.Shape();
  shape.moveTo(x + radius, y); shape.lineTo(x + w - radius, y); shape.quadraticCurveTo(x + w, y, x + w, y + radius);
  shape.lineTo(x + w, y + h - radius); shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  shape.lineTo(x + radius, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - radius);
  shape.lineTo(x, y + radius); shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: Math.min(1.6, radius / 4), bevelThickness: Math.min(1.2, depth / 4), bevelSegments: 3, steps: 1, curveSegments: 16 });
  geometry.translate(0, 0, -depth / 2); return geometry;
}
function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0): THREE.Mesh {
  const object = new THREE.Mesh(geometry, material); object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
}
function drum(parent: THREE.Object3D, radius: number, depth: number, material: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const object = mesh(parent, new THREE.CylinderGeometry(radius, radius, depth, 96), material, x, y, z); object.rotation.x = Math.PI / 2; return object;
}

function makeDeck(): { group: THREE.Group; arm: THREE.Group; light: THREE.MeshStandardMaterial; strobe: THREE.Group } {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: '#765039', map: createSurface('wood'), roughness: .44 });
  const alloy = new THREE.MeshStandardMaterial({ color: '#a4a9a5', map: createSurface('metal'), metalness: .85, roughness: .27 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#d2d6d2', metalness: 1, roughness: .16 });
  const dark = new THREE.MeshStandardMaterial({ color: '#141918', roughness: .65, metalness: .2 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#101312', roughness: .94 });
  const brass = new THREE.MeshStandardMaterial({ color: '#ad8660', metalness: .85, roughness: .24 });
  const red = new THREE.MeshStandardMaterial({ color: '#ac3e25', roughness: .4 });
  for (const fx of [-245, 245]) for (const fy of [-151, 151]) { drum(group, 29, 26, rubber, fx, fy, -35); drum(group, 31, 7, alloy, fx, fy, -23); }
  mesh(group, roundedBox(600, 400, 38, 12), wood);
  mesh(group, roundedBox(579, 379, 9, 8), alloy, 0, 0, 24);
  mesh(group, roundedBox(566, 366, 1, 6), new THREE.MeshStandardMaterial({ color: '#292f2c', metalness: .76, roughness: .32 }), 0, 0, 30);
  for (const sx of [-269, 269]) for (const sy of [-169, 169]) {
    drum(group, 3.6, 1.6, chrome, sx, sy, 32); mesh(group, new THREE.BoxGeometry(4.5, .8, .6), dark, sx, sy, 33);
  }
  drum(group, 150, 8, dark, -108, 6, 32);
  drum(group, 144, 20, chrome, -108, 6, 44);
  drum(group, 137, 3, rubber, -108, 6, 56);
  const strobe = new THREE.Group(); strobe.position.set(-108, 6, 48); group.add(strobe);
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(1.3, 6, 5), dark, 240);
  const transform = new THREE.Object3D();
  for (let i = 0; i < 240; i++) { const angle = i % 120 / 120 * Math.PI * 2; const radius = i < 120 ? 142 : 139; transform.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, i < 120 ? 0 : 5); transform.updateMatrix(); dots.setMatrixAt(i, transform.matrix); }
  strobe.add(dots);
  for (let radius = 24; radius < 131; radius += 12) mesh(group, new THREE.TorusGeometry(radius, .35, 4, 96), dark, -108, 6, 58);
  drum(group, 2.5, 14, chrome, -108, 6, 63);

  // Machined gimbal, counterweight and a swept S-shaped arm with a separate cartridge.
  drum(group, 27, 8, dark, 179, 113, 36); drum(group, 21, 17, alloy, 179, 113, 48);
  const gimbal = mesh(group, new THREE.TorusGeometry(17, 3.5, 10, 48), chrome, 179, 113, 67); gimbal.rotation.y = Math.PI / 2;
  const arm = new THREE.Group(); arm.position.set(179, 113, 73); group.add(arm);
  drum(arm, 15, 21, chrome, 0, 36, 0); drum(arm, 15.5, 2, dark, 0, 40, 12);
  for (let j = 0; j < 6; j++) mesh(arm, new THREE.TorusGeometry(15, .65, 5, 36), dark, 0, 36, -8 + j * 3);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 20, 0), new THREE.Vector3(0, -28, 0), new THREE.Vector3(-35, -79, -1), new THREE.Vector3(-110, -129, -3), new THREE.Vector3(-158, -148, -7)]);
  mesh(arm, new THREE.TubeGeometry(curve, 60, 3.2, 14, false), chrome);
  const headshell = mesh(arm, roundedBox(33, 15, 7, 2), dark, -166, -150, -8); headshell.rotation.z = .23;
  for (let i = 0; i < 4; i++) mesh(arm, new THREE.BoxGeometry(13, 1, 1), alloy, -166, -155 + i * 3, -3);
  mesh(arm, new THREE.BoxGeometry(14, 10, 8), red, -178, -152, -15);
  mesh(arm, new THREE.ConeGeometry(1.2, 6, 12), chrome, -181, -153, -22).rotation.x = Math.PI / 2;
  mesh(group, new THREE.BoxGeometry(9, 43, 8), dark, 197, 10, 40); drum(group, 4, 7, chrome, 197, -12, 45);
  mesh(group, new THREE.BoxGeometry(5, 120, 2), dark, 253, -62, 32);
  for (let i = 0; i < 11; i++) mesh(group, new THREE.BoxGeometry(i === 5 ? 15 : 7, .8, .5), alloy, 237, -7 - i * 11, 32);
  mesh(group, roundedBox(24, 11, 5, 2), chrome, 253, -62, 37);
  drum(group, 17, 9, dark, -254, -147, 35); drum(group, 13, 4, chrome, -254, -147, 42);
  for (let i = 0; i < 2; i++) mesh(group, roundedBox(34, 15, 4, 2), alloy, -203 + i * 43, -147, 34);
  const light = new THREE.MeshStandardMaterial({ color: '#d75827', emissive: '#d75827', emissiveIntensity: .1, roughness: .3 });
  drum(group, 3, 3, light, -222, -169, 34);
  drum(group, 10, 16, dark, -246, -98, 39); drum(group, 8, 3, chrome, -246, -98, 49);

  const legend = document.createElement('canvas'); legend.width = 1800; legend.height = 1200;
  const ctx = legend.getContext('2d')!; ctx.scale(3, 3); ctx.fillStyle = '#d4d8c9';
  ctx.font = '700 12px sans-serif'; ctx.fillText('MANGO MAGIC', 32, 32); ctx.font = '7px monospace'; ctx.fillText('REFERENCE SERIES / MM—01', 365, 30);
  ctx.fillText('QUARTZ LOCKED · DIRECT DRIVE', 30, 49); ctx.fillText('PITCH ADJUST', 481, 190); ctx.fillText('33⅓', 83, 235 + 130); ctx.fillText('45', 130, 365); ctx.fillText('POWER', 27, 385); ctx.fillText('ANTI-SKATE', 448, 65); ctx.fillText('0    1    2    3', 420, 84);
  ctx.fillStyle = '#999f92'; ctx.font = '5px monospace'; ctx.fillText('PRECISION BEARING / HAND ASSEMBLED', 340, 370);
  const legendTexture = new THREE.CanvasTexture(legend); legendTexture.colorSpace = THREE.SRGBColorSpace;
  mesh(group, new THREE.PlaneGeometry(600, 400), new THREE.MeshBasicMaterial({ map: legendTexture, transparent: true, depthWrite: false }), 0, 0, 33);
  return { group, arm, light, strobe };
}

export const PhysicalRecordStage: FC<Props> = props => {
  const container = useRef<HTMLDivElement>(null);
  const current = useRef(props); current.current = props;
  const surfaces = useRef<{ front: THREE.MeshStandardMaterial; back: THREE.MeshStandardMaterial; label: THREE.MeshStandardMaterial } | null>(null);

  useEffect(() => {
    const element = container.current; if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { current.current.onUnavailable(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.setClearColor(0x000000, 0);
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-720, 720, 460, -460, .1, 3000); camera.position.z = 1400;
    scene.add(new THREE.HemisphereLight('#fff8e8', '#515544', 1.5));
    const key = new THREE.DirectionalLight('#fff7e8', 2.2); key.position.set(-450, 650, 1100); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -1500; key.shadow.camera.right = 1500; key.shadow.camera.top = 1500; key.shadow.camera.bottom = -1500; key.shadow.camera.far = 3000; key.shadow.normalBias = .5; key.shadow.radius = 4; scene.add(key);
    const fill = new THREE.DirectionalLight('#e0edff', .8); fill.position.set(750, 100, 600); scene.add(fill);
    // Broad studio panels provide actual metal reflections, rather than painted highlights.
    const studio = new THREE.Scene(); studio.background = new THREE.Color('#5c625e');
    for (const [x, y, z, w, h] of [[-6, 5, 2, 3, 10], [6, 2, 0, 2, 8], [0, 7, -2, 10, 2]]) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: '#fff7e8', side: THREE.DoubleSide })); panel.position.set(x, y, z); panel.lookAt(0, 0, 0); studio.add(panel);
    }
    const pmrem = new THREE.PMREMGenerator(renderer); const environment = pmrem.fromScene(studio, .08); scene.environment = environment.texture;
    studio.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (object.material as THREE.Material).dispose(); } });

    const sleeve = new THREE.Group(); scene.add(sleeve);
    const front = new THREE.MeshStandardMaterial({ color: '#b9613d', roughness: .83 });
    const back = new THREE.MeshStandardMaterial({ color: '#e9dfc6', roughness: .92 });
    const paper = new THREE.MeshStandardMaterial({ color: '#c3af83', roughness: 1 });
    mesh(sleeve, new THREE.PlaneGeometry(1, 1), front, 0, 0, .013);
    mesh(sleeve, new THREE.PlaneGeometry(1, 1), back, 0, 0, -.013).rotation.y = Math.PI;
    mesh(sleeve, new THREE.BoxGeometry(.008, 1, .026), paper, .5, 0, 0);
    mesh(sleeve, new THREE.BoxGeometry(1, .008, .026), paper, 0, -.5, 0);
    mesh(sleeve, new THREE.BoxGeometry(1, .008, .026), paper, 0, .5, 0);
    // The unsealed left edge exposes the pocket and two separate paper lips.
    mesh(sleeve, new THREE.BoxGeometry(.01, 1, .003), paper, -.5, 0, .011);
    mesh(sleeve, new THREE.BoxGeometry(.01, 1, .003), paper, -.5, 0, -.011);
    const vinyl = new THREE.Group(); scene.add(vinyl); const spinning = new THREE.Group(); vinyl.add(spinning);
    const groove = createSurface('grooves');
    const vinylMaterial = new THREE.MeshPhysicalMaterial({ color: '#b6bdb5', map: groove, bumpMap: groove, bumpScale: .0005, roughness: .24, metalness: .35, clearcoat: .7, clearcoatRoughness: .17 });
    drum(spinning, .47, .007, vinylMaterial, 0, 0, 0);
    const etchedGrooves = new THREE.InstancedMesh(new THREE.TorusGeometry(1, .0012, 3, 128), new THREE.MeshStandardMaterial({ color: '#45493d', roughness: .36, metalness: .5 }), 55);
    const grooveMatrix = new THREE.Object3D();
    for (let i = 0; i < 55; i++) { grooveMatrix.position.z = .004; grooveMatrix.scale.setScalar(.17 + i * .0054); grooveMatrix.updateMatrix(); etchedGrooves.setMatrixAt(i, grooveMatrix.matrix); }
    spinning.add(etchedGrooves);
    const label = new THREE.MeshStandardMaterial({ color: '#c7683d', roughness: .75 });
    mesh(spinning, new THREE.CircleGeometry(.155, 96), label, 0, 0, .004);
    mesh(spinning, new THREE.CircleGeometry(.155, 96), label, 0, 0, -.004).rotation.y = Math.PI;
    drum(spinning, .008, .01, new THREE.MeshStandardMaterial({ color: '#eee1c7', metalness: .7, roughness: .3 }), 0, 0, 0);
    surfaces.current = { front, back, label };
    const deck = makeDeck(); scene.add(deck.group);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6000, 4000), new THREE.ShadowMaterial({ opacity: .17 })); shadow.position.z = -100; shadow.receiveShadow = true; scene.add(shadow);
    let lastWidth = 0, lastHeight = 0, last = performance.now(), rotation = 0, raf = 0, inView = true;
    const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; });
    visibility.observe(element);
    const offset = new THREE.Vector3(); const extractionPose = new THREE.Quaternion(); const destinationPose = new THREE.Quaternion();
    const frame = (now: number): void => {
      if (!inView || document.hidden) { last = now; raf = requestAnimationFrame(frame); return; }
      const p = current.current; const progress = p.position.get(); const dt = Math.min((now - last) / 1000, .05); last = now;
      if (p.width !== lastWidth || p.height !== lastHeight) {
        lastWidth = p.width; lastHeight = p.height; renderer.setSize(p.width, p.height, false); camera.left = -p.width / 2; camera.right = p.width / 2; camera.top = p.height / 2; camera.bottom = -p.height / 2; camera.updateProjectionMatrix();
      }
      const pose = collectionPose(element, progress, p.x.get(), p.y.get(), p.baseSize * p.scale.get(), p.rotateY.get(), p.rotateZ.get());
      const sleeveScale = pose.size;
      sleeve.position.set(pose.x, -pose.y, 30); sleeve.scale.setScalar(sleeveScale);
      sleeve.rotation.set(progress < .5 ? .12 : 0, radians(pose.turn), -radians(pose.tilt));
      sleeve.visible = p.opacity.get() > .03 && progress < 5.85;
      if (progress < 5.05) {
        vinyl.position.copy(sleeve.position); vinyl.quaternion.copy(sleeve.quaternion); vinyl.scale.setScalar(sleeveScale);
        offset.set(-p.exposure.get() * sleeveScale, 0, 0).applyQuaternion(sleeve.quaternion); vinyl.position.add(offset);
        vinyl.visible = sleeve.visible;
      } else {
        const small = p.baseSize * .43, mobile = p.width < 760;
        const startX = p.width * (mobile ? .025 : .12), startY = -p.height * .14;
        extractionPose.setFromEuler(new THREE.Euler(0, 0, radians(-14)));
        offset.set(-small * 1.07, 0, 0).applyQuaternion(extractionPose);
        const release = smooth((progress - 5.05) / .27);
        const travel = smooth((progress - 5.32) / .68);
        vinyl.position.set(mix(startX + offset.x * release, p.landing.x, travel), mix(startY + offset.y * release, -p.landing.y, travel) + Math.sin(travel * Math.PI) * p.height * .23, mix(30, 5 + 59 * (p.baseSize * p.landing.scale * .94 / 276), travel));
        destinationPose.setFromEuler(new THREE.Euler(0, 0, 0)); vinyl.quaternion.copy(extractionPose).slerp(destinationPose, travel);
        vinyl.scale.setScalar(mix(small, p.baseSize * p.landing.scale, travel)); vinyl.visible = true;
      }
      if (p.playing) rotation += dt * .75; spinning.rotation.z = -rotation;
      const reveal = smooth((progress - 5.25) / .65);
      const factor = p.baseSize * p.landing.scale * .94 / 276;
      deck.group.scale.setScalar(factor);
      deck.group.position.set(p.landing.x + 108 * factor, -p.landing.y - 6 * factor - (1 - reveal) * p.height * .7, 5);
      deck.group.visible = progress > 5.25;
      deck.arm.rotation.z = mix(deck.arm.rotation.z, p.playing ? -.12 : .48, 1 - Math.exp(-dt * 4));
      deck.light.emissiveIntensity = p.playing ? 1.8 : .05; deck.strobe.rotation.z = -rotation * .2;
      etchedGrooves.visible = vinyl.scale.x * .94 > 330;
      element.dataset.pose = JSON.stringify({ p: progress, x: pose.x, y: pose.y, scale: pose.size / p.baseSize, visible: sleeve.visible, w: p.width, h: p.height, base: p.baseSize });
      renderer.render(scene, camera); raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); visibility.disconnect(); surfaces.current = null;
      const materials = new Set<THREE.Material>(); const maps = new Set<THREE.Texture>();
      scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material); } });
      materials.forEach(material => { for (const value of Object.values(material)) if (value instanceof THREE.Texture) maps.add(value); material.dispose(); }); maps.forEach(map => map.dispose());
      environment.dispose(); pmrem.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const apply = (artwork: Awaited<ReturnType<typeof createRecordArtwork>>): void => {
      const materials = surfaces.current;
      if (cancelled || !materials) { Object.values(artwork).forEach(map => map.dispose()); return; }
      for (const key of ['front', 'back', 'label'] as const) { materials[key].map?.dispose(); materials[key].map = artwork[key]; materials[key].color.set('#ffffff'); materials[key].needsUpdate = true; }
    };
    void createRecordArtwork(props.episode, false).then(apply);
    void createRecordArtwork(props.episode).then(apply);
    return () => { cancelled = true; };
  }, [props.episode]);

  return <div className="physical-record-stage" ref={container} aria-hidden="true" />;
};
