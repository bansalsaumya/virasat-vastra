import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

// A saree-like drape: a twisted, rippling ribbon wrapped around a column
function Drape({ color }) {
  const mat = useRef();
  const geo = useMemo(() => new THREE.PlaneGeometry(1.4, 6, 24, 160), []);
  const base = useMemo(() => geo.attributes.position.array.slice(), [geo]);
  const target = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) {
      const x = base[i], y = base[i + 1];
      const a = y * 1.1 + t * 0.3;             // spiral angle along length
      const r = 0.9 + Math.sin(y * 3 + t) * 0.06 + x * 0.25;
      p[i] = Math.cos(a) * r;
      p[i + 1] = y * 0.55;
      p[i + 2] = Math.sin(a) * r + Math.sin(x * 6 + t * 2) * 0.03;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    mat.current.color.lerp(target.set(color), 0.08);
  });

  return (
    <mesh geometry={geo} castShadow>
      <meshPhysicalMaterial
        ref={mat}
        side={THREE.DoubleSide}
        roughness={0.3}
        sheen={1}
        sheenColor="#ffe6a8"
        clearcoat={0.5}
      />
    </mesh>
  );
}

function GoldBorder() {
  return (
    <mesh position={[0, -1.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.05, 0.05, 16, 100]} />
      <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
    </mesh>
  );
}

export default function FabricViewer({ color }) {
  return (
    <Canvas camera={{ position: [0, 0.5, 5.5], fov: 40 }} dpr={[1, 2]} shadows>
      <color attach="background" args={['#fbf6ee']} />
      <ambientLight intensity={0.5} />
      <spotLight position={[3, 5, 4]} intensity={50} penumbra={1} castShadow />
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
        <Drape color={color} />
        <GoldBorder />
      </Float>
      <ContactShadows position={[0, -2.1, 0]} opacity={0.4} blur={2.5} scale={6} />
      <Environment preset="apartment" />
      <OrbitControls enablePan={false} minDistance={3.5} maxDistance={8} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}
