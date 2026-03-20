"use client";

import { Suspense, useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Model({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  const hasNotified = useRef(false);

  // Clone the scene to avoid mutation issues on re-render
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Clone materials to avoid shared material issues
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else if (mesh.material) {
          mesh.material = mesh.material.clone();
        }
      }
    });

    // Auto-fit: scale and center (centered vertically at origin)
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 1.5 / maxDim : 1;
    clone.scale.setScalar(s);
    clone.position.set(-center.x * s, -center.y * s, -center.z * s);

    return clone;
  }, [scene]);

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
      <primitive object={clonedScene} />
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as HTMLDivElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (containerRef.current as HTMLDivElement & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
        (document as Document & { webkitExitFullscreen: () => void }).webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Listen for fullscreen exit via Escape key
  useState(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  });

  return (
    <div
      ref={containerRef}
      className={`relative ${isFullscreen ? "bg-gray-900" : ""} ${className}`}
    >
      {!loaded && <LoadingSpinner />}
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />

        <Suspense fallback={null}>
          <Model url={modelUrl} onLoaded={() => setLoaded(true)} />
        </Suspense>

        <ContactShadows
          position={[0, -0.75, 0]}
          opacity={0.3}
          scale={3}
          blur={2}
          far={2}
        />

        <Environment preset="city" />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={1}
          maxDistance={4}
          autoRotate={false}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Fullscreen button */}
      {loaded && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 rounded-lg bg-black/40 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>
      )}

      {/* Instructions badge */}
      {loaded && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
          </svg>
          <span className="text-[10px] font-medium text-gray-500">Drag to rotate &bull; Scroll to zoom</span>
        </div>
      )}
    </div>
  );
}
