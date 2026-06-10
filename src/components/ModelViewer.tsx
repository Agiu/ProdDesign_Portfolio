import { Suspense, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, ContactShadows } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements { }
  }
}

interface ModelProps {
  url: string;
}

const Model = ({ url }: ModelProps) => {
  const geom = useLoader(STLLoader as any, url) as THREE.BufferGeometry;

  useEffect(() => {
    // Ensure smooth shading for toon material by computing vertex normals
    if (geom) {
      geom.computeVertexNormals();
    }
  }, [geom]);

  return (
    <mesh geometry={geom} castShadow receiveShadow>
      {/* Cartoonish highly stylized material */}
      <meshToonMaterial color="#ffffff" />
    </mesh>
  );
};

interface ModelViewerProps {
  url: string;
  darkColor: string;
}

export function ModelViewer({ url, darkColor }: ModelViewerProps) {
  return (
    <div className="w-full h-[500px] my-16 relative not-prose bg-transparent rounded-[2rem] overflow-hidden">
      {/* Visual cue that it's interactive */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 text-xs tracking-widest uppercase font-bold" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        Drag to Rotate
      </div>

      <Canvas camera={{ position: [0, 40, 120], fov: 45 }}>
        {/* Stylized lighting setup */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[50, 100, 50]} intensity={2} castShadow />
        <directionalLight position={[-50, -20, -50]} intensity={0.5} />

        <Suspense fallback={null}>
          <Center>
            <Model url={url} />
          </Center>

          {/* Shadow perfectly matching the page dark color algorithm */}
          <ContactShadows
            position={[0, -30, 0]}
            opacity={0.8}
            scale={150}
            blur={3}
            far={100}
            color={darkColor}
          />
        </Suspense>

        {/* Disable zoom and pan, only drag to rotate. Added autoRotate for a showcase feel */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Canvas>
    </div>
  );
}
