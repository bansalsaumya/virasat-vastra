import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// A silk drape: a plane whose vertices ripple like fabric in wind
function SilkCloth({ color = '#8a1524', position = [0, 0, 0], rotation = [0, 0, 0], speed = 1 }) {
  const mesh = useRef();
  const geo = useMemo(() => new THREE.PlaneGeometry(3.2, 5, 64, 96), []);
  const base = useMemo(() => geo.attributes.position.array.slice(), [geo]);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime() * speed;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      // pinned at top (y = 2.5), free at bottom
      const free = (2.5 - y) / 5;
      pos[i + 2] =
        free * (Math.sin(x * 1.6 + t * 1.4) * 0.35 + Math.sin(y * 2.1 + t * 1.1) * 0.25) +
        free * pointer.x * 0.6 * Math.sin(y + t);
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    mesh.current.rotation.y = rotation[1] + pointer.x * 0.25;
    mesh.current.rotation.x = rotation[0] - pointer.y * 0.1;
  });

  return (
    <mesh ref={mesh} geometry={geo} position={position} rotation={rotation} castShadow>
      <meshPhysicalMaterial
        color={color}
        side={THREE.DoubleSide}
        roughness={0.35}
        metalness={0.15}
        sheen={1}
        sheenColor="#ffd98a"
        sheenRoughness={0.3}
        clearcoat={0.4}
      />
    </mesh>
  );
}

// Golden zari ring floating in front
function ZariRing() {
  const ref = useRef();
  useFrame((_, d) => {
    ref.current.rotation.x += d * 0.3;
    ref.current.rotation.y += d * 0.5;
  });
  return (
    <Float speed={2} floatIntensity={1.2}>
      <mesh ref={ref} position={[2.6, 0.8, 1]}>
        <torusKnotGeometry args={[0.45, 0.12, 200, 24]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.15} />
      </mesh>
    </Float>
  );
}

export default function HeroSilk() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]} style={{ position: 'absolute', inset: 0 }}>
      <color attach="background" args={['#160205']} />
      <fog attach="fog" args={['#160205', 7, 16]} />
      <ambientLight intensity={0.35} />
      <spotLight position={[4, 6, 6]} angle={0.5} penumbra={1} intensity={60} color="#ffe2a8" />
      <pointLight position={[-5, -2, 3]} intensity={25} color="#ff4d6a" />
      <SilkCloth color="#7a0f20" position={[-3, 0.3, -1]} rotation={[0, 0.4, 0]} speed={0.9} />
      <SilkCloth color="#b8862b" position={[3.4, 0.1, -2]} rotation={[0, -0.5, 0]} speed={1.1} />
      <SilkCloth color="#3a0a14" position={[0, 0.5, -4]} rotation={[0, 0, 0]} speed={0.7} />
      <ZariRing />
      <Sparkles count={120} scale={[12, 7, 6]} size={3} speed={0.4} color="#f7df94" />
      <Environment preset="sunset" />
    </Canvas>
  );
}
