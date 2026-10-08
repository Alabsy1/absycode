"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Shape({ variant }: { variant: "sphere" | "cube" }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.25;
    ref.current.rotation.x += delta * 0.08;
    const p = state.pointer;
    ref.current.rotation.y += p.x * 0.0015;
    ref.current.rotation.x += -p.y * 0.0015;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.12;
  });
  return (
    <group ref={ref}>
      {variant === "cube" ? (
        <mesh>
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          <meshBasicMaterial wireframe color="#FAF3EC" transparent opacity={0.7} />
        </mesh>
      ) : (
        <mesh>
          <icosahedronGeometry args={[1.9, 1]} />
          <meshBasicMaterial wireframe color="#382216" transparent opacity={0.4} />
        </mesh>
      )}
      {variant === "sphere" &&
        [-2.6, 2.6, 0].map((x, i) => (
          <mesh key={i} position={[x, i === 2 ? 1.6 : -1.2 + i * 0.4, -1]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#B5622F" transparent opacity={0.8} />
          </mesh>
        ))}
    </group>
  );
}

export default function WireframeCanvas({ variant = "sphere", className = "" }: { variant?: "sphere" | "cube"; className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5.2], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <Shape variant={variant} />
      </Canvas>
    </div>
  );
}
