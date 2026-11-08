import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

const RADIUS = 5;

// Each card is a curved slice of a cylinder, textured with the saree photo
function CurvedPanel({ item, index, total, onSelect }) {
  const tex = useTexture(item.image);
  tex.colorSpace = THREE.SRGBColorSpace;
  const [hover, setHover] = useState(false);
  const slice = (Math.PI * 2) / total;
  const width = slice * 0.82;
  const ref = useRef();

  useFrame(() => {
    const s = hover ? 1.06 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
  });

  return (
    <group rotation={[0, index * slice, 0]}>
      <mesh
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(item); }}
      >
        {/* open cylinder segment, inside face visible = concave view */}
        <cylinderGeometry args={[RADIUS, RADIUS, 3.4, 32, 1, true, -width / 2, width]} />
        <meshStandardMaterial map={tex} side={THREE.BackSide} roughness={0.5} />
      </mesh>
      <Html position={[0, -2.1, -RADIUS + 0.05]} center transform rotation={[0, 0, 0]} distanceFactor={6}>
        <div className="gl-label">
          <strong>{item.name}</strong>
          <span>₹{item.price.toLocaleString('en-IN')}</span>
        </div>
      </Html>
    </group>
  );
}

function Ring({ items, onSelect }) {
  const g = useRef();
  useFrame((_, d) => { g.current.rotation.y += d * 0.08; });
  return (
    <group ref={g}>
      {items.map((it, i) => (
        <CurvedPanel key={it.id} item={it} index={i} total={items.length} onSelect={onSelect} />
      ))}
    </group>
  );
}

export default function CylinderGallery({ items, onSelect }) {
  return (
    <Canvas camera={{ position: [0, 0.3, 0.01], fov: 70 }} dpr={[1, 2]}>
      <color attach="background" args={['#f3ece0']} />
      <ambientLight intensity={1.1} />
      <pointLight position={[0, 3, 0]} intensity={20} color="#ffe2a8" />
      <Suspense fallback={null}>
        <Ring items={items} onSelect={onSelect} />
      </Suspense>
      {/* camera sits at the center of the ring; drag to look around with inertia */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={-0.4}
        enableDamping
        dampingFactor={0.06}
        minPolarAngle={Math.PI / 2 - 0.15}
        maxPolarAngle={Math.PI / 2 + 0.15}
      />
    </Canvas>
  );
}
