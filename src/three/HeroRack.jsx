// The hero's 3D moment: a small network rack that powers on port by port,
// then carries traffic out to the devices around it. Follows the pointer gently.
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

const GREEN = new THREE.Color('#3BE38B');
const YELLOW = new THREE.Color('#FFE000');
const OFF = new THREE.Color('#0b1a3a');

function Leds({ count, y, z, width, start, colorEvery = 4 }) {
  const refs = useRef([]);
  const spacing = width / count;
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((m, i) => {
      if (!m) return;
      const on = t > start + i * 0.035;
      const flicker = on ? 0.55 + 0.45 * Math.max(0, Math.sin(t * (3 + (i % 5)) + i * 1.7)) : 0;
      m.material.emissiveIntensity = flicker * 2.2;
      m.material.color.copy(on ? (i % colorEvery === 0 ? YELLOW : GREEN) : OFF);
      m.material.emissive.copy(i % colorEvery === 0 ? YELLOW : GREEN);
    });
  });
  return Array.from({ length: count }).map((_, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[-width / 2 + spacing * (i + 0.5), y, z]}>
      <boxGeometry args={[0.035, 0.035, 0.02]} />
      <meshStandardMaterial color={OFF} emissive={GREEN} emissiveIntensity={0} toneMapped={false} />
    </mesh>
  ));
}

function Ports({ count, rows = 2, y, z, width }) {
  const spacing = width / count;
  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < count; i++) {
      items.push(
        <mesh key={`${r}-${i}`} position={[-width / 2 + spacing * (i + 0.5), y - r * 0.11, z]}>
          <boxGeometry args={[spacing * 0.72, 0.075, 0.02]} />
          <meshStandardMaterial color="#050c1f" roughness={0.6} />
        </mesh>,
      );
    }
  }
  return items;
}

function Unit({ y, height = 0.34, kind, start }) {
  const w = 3.2;
  const d = 1.6;
  const front = d / 2 + 0.001;
  return (
    <group position={[0, y, 0]}>
      <RoundedBox args={[w, height, d]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color={kind === 'firewall' ? '#2a4a94' : '#23407f'} metalness={0.45} roughness={0.38} />
      </RoundedBox>
      {/* rack ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 + 0.09), 0, d / 2 - 0.02]}>
          <boxGeometry args={[0.18, height, 0.04]} />
          <meshStandardMaterial color="#0a1a3f" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {kind === 'switch' && (
        <>
          <Ports count={24} y={0.06} z={front} width={2.3} />
          <Leds count={24} y={-0.12} z={front} width={2.3} start={start} />
          <mesh position={[1.35, 0, front]}><boxGeometry args={[0.32, 0.18, 0.02]} /><meshStandardMaterial color="#FFE000" emissive="#FFE000" emissiveIntensity={0.25} /></mesh>
        </>
      )}
      {kind === 'firewall' && (
        <>
          <mesh position={[0, height / 2 - 0.03, front]}><boxGeometry args={[w - 0.1, 0.05, 0.02]} /><meshStandardMaterial color="#FFE000" emissive="#FFE000" emissiveIntensity={0.35} /></mesh>
          <Ports count={8} rows={1} y={0} z={front} width={1.2} />
          <group position={[1, 0, 0]}><Leds count={6} y={0} z={front} width={0.7} start={start} colorEvery={3} /></group>
        </>
      )}
      {kind === 'server' && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[-1.3 + i * 0.3, 0, front]}>
              <boxGeometry args={[0.24, height * 0.7, 0.02]} />
              <meshStandardMaterial color="#071230" roughness={0.5} />
            </mesh>
          ))}
          <group position={[1.25, 0, 0]}><Leds count={4} y={0} z={front} width={0.36} start={start} colorEvery={2} /></group>
        </>
      )}
    </group>
  );
}

function Packets() {
  const nodes = useMemo(() => [
    [-2.7, 1.5, -0.6], [2.8, 1.3, -0.8], [-2.5, -1.4, 0.4], [2.6, -1.2, 0.6], [0.3, 2.1, -1.4],
  ].map((p) => new THREE.Vector3(...p)), []);
  const curves = useMemo(() => nodes.map((n) => new THREE.CatmullRomCurve3([
    new THREE.Vector3(n.x > 0 ? 1.6 : -1.6, 0, 0.3), new THREE.Vector3(n.x * 0.6, n.y * 0.5 + 0.3, n.z + 0.6), n,
  ])), [nodes]);
  const lines = useMemo(() => curves.map((c) => new THREE.BufferGeometry().setFromPoints(c.getPoints(40))), [curves]);
  const dots = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    dots.current.forEach((m, i) => {
      if (!m) return;
      const visible = t > 1.6;
      const k = ((t * 0.35 + i * 0.27) % 1);
      const c = curves[i % curves.length];
      m.position.copy(c.getPoint(i >= curves.length ? 1 - k : k));
      m.visible = visible;
    });
  });
  return (
    <group>
      {lines.map((g, i) => (
        <line key={i} geometry={g}>
          <lineBasicMaterial color="#3d64c9" transparent opacity={0.45} />
        </line>
      ))}
      {nodes.map((n, i) => (
        <mesh key={i} position={n}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color="#9fb6ff" emissive="#2F6BFF" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: curves.length * 2 }).map((_, i) => (
        <mesh key={i} ref={(el) => (dots.current[i] = el)} visible={false}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color={i % 3 === 0 ? '#FFE000' : '#3BE38B'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ children }) {
  const g = useRef();
  useFrame(({ pointer, clock }) => {
    if (!g.current) return;
    const t = clock.getElapsedTime();
    const intro = Math.min(1, t / 1.4);
    const ease = 1 - Math.pow(1 - intro, 3);
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, -0.5 + ease * 0.32 + pointer.x * 0.28, 0.06);
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, 0.16 - pointer.y * 0.12, 0.06);
    g.current.position.y = THREE.MathUtils.lerp(g.current.position.y, -0.4 + ease * 0.4, 0.08);
  });
  return <group ref={g} rotation={[0.16, -0.9, 0]}>{children}</group>;
}

export default function HeroRack({ still = false }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.5, 7.4], fov: 36 }}
      frameloop={still ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.7} />
      <hemisphereLight args={['#bcd0ff', '#0a1a3f', 0.9]} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <directionalLight position={[-5, 2, -3]} intensity={0.6} color="#2F6BFF" />
      <pointLight position={[0, -1, 3]} intensity={6} distance={6} color="#2F6BFF" />
      <Float speed={still ? 0 : 1.2} rotationIntensity={0.08} floatIntensity={0.25}>
        <Rig>
          <Unit y={0.42} kind="firewall" start={0.5} />
          <Unit y={0} kind="switch" start={0.8} />
          <Unit y={-0.5} height={0.58} kind="server" start={1.5} />
          <Packets />
        </Rig>
      </Float>
      <ContactShadows position={[0, -1.6, 0]} opacity={0.45} scale={10} blur={2.6} far={3} color="#000820" />
    </Canvas>
  );
}
