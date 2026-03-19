"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Model({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  const hasNotified = useRef(false);
  const scaled = useRef(false);

  // Auto-fit on first render using useMemo-like pattern
  if (!scaled.current) {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 1.5 / maxDim : 1;
    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -center.y * s, -center.z * s);
    scaled.current = true;
  }

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3;
      if (!hasNotified.current) {
        hasNotified.current = true;
        onLoaded();
      }
    }
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-red-500" />
      <p className="mt-3 text-xs font-medium text-gray-400">Loading 3D model...</p>
    </div>
  );
}

export default function ModelViewer({
  modelUrl,
  className = "",
}: {
  modelUrl: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && <LoadingSpinner />}
      <Canvas
        camera={{ position: [0, 0.3, 1.8], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />

        <Suspense fallback={null}>
          <Model url={modelUrl} onLoaded={() => setLoaded(true)} />
        </Suspense>

        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.3}
          scale={3}
          blur={2}
          far={2}
        />

        <Environment preset="city" />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={0.8}
          maxDistance={4}
          autoRotate={false}
          target={[0, 0.15, 0]}
        />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
        </svg>
        <span className="text-[10px] font-medium text-gray-500">Drag to rotate &bull; Scroll to zoom</span>
      </div>
    </div>
  );
}
