import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

function GoldenZariThread({ scrollProgress = 0 }) {
  const meshRef = useRef();
  const geo = useMemo(() => new THREE.PlaneGeometry(14, 1.4, 96, 16), []);
  const basePos = useMemo(() => geo.attributes.position.array.slice(), [geo]);

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = geo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePos[i];
      const y = basePos[i + 1];
      pos[i + 2] =
        Math.sin(x * 0.65 + t * 1.3 + scrollProgress * 4) * 0.42 +
        Math.cos(y * 1.8 + t * 0.9) * 0.16 +
        pointer.x * 0.25 * Math.sin(x * 0.4 + t);
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    meshRef.current.rotation.z = -0.12 + pointer.y * 0.04;
    meshRef.current.position.y = -2.2 + scrollProgress * 0.8;
  });

  return (
    <mesh ref={meshRef} geometry={geo} position={[0, -2.2, -1]}>
      <meshPhysicalMaterial
        color="#8e1122"
        emissive="#3b050c"
        side={THREE.DoubleSide}
        roughness={0.28}
        metalness={0.25}
        sheen={1}
        sheenColor="#f7df94"
        clearcoat={0.5}
        transparent
        opacity={0.42}
      />
    </mesh>
  );
}

function FloatingZariEmblem() {
  const ringRef = useRef();
  useFrame(({ clock, pointer }) => {
    if (!ringRef.current) return;
    const t = clock.getElapsedTime();
    ringRef.current.rotation.y = t * 0.35 + pointer.x * 0.5;
    ringRef.current.rotation.x = Math.sin(t * 0.4) * 0.25 + pointer.y * 0.3;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={ringRef} position={[4.2, 1.3, -1.5]}>
        <torusKnotGeometry args={[0.38, 0.06, 128, 24, 2, 3]} />
        <meshStandardMaterial
          color="#f7df94"
          metalness={0.95}
          roughness={0.18}
          transparent
          opacity={0.45}
        />
      </mesh>
    </Float>
  );
}

export default function ShowroomParticles({ scrollProgress = 0, showSilkWave = true }) {
  return (
    <div className="hero-three-canvas-layer" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffe6a3" />
        <pointLight position={[-4, -2, 3]} intensity={1.4} color="#ff5e7e" />
        <Sparkles
          count={95}
          scale={[12, 7, 4]}
          size={2.2}
          speed={0.45}
          opacity={0.75}
          color="#f7df94"
        />
        <FloatingZariEmblem />
        {showSilkWave && <GoldenZariThread scrollProgress={scrollProgress} />}
      </Canvas>
    </div>
  );
}

