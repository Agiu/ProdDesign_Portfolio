"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import styles from "../CaseStudy.module.css";

/**
 * The `3d-model` custom block — a single STL URL on its own line.
 *
 * Renders the Figma "3D model" widget: a dark card with the orbit icon and the
 * shared corner ornament, and an interactive STL viewer filling it (drag to
 * rotate; a slow auto-rotate at rest, suppressed under reduced-motion).
 *
 * Look: cel-shaded (MeshToonMaterial with a hard-banded ramp) + a black
 * inverted-hull outline and a cool rim light, for a sharp, techy read. The
 * model is auto-oriented so its broad face points at the camera rather than
 * lying flat. three and its loaders are imported lazily inside the effect so
 * nothing 3D touches the server render or the initial bundle.
 */
export function ModelViewer({ content }: { content: string }) {
  const src =
    content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)[0] ?? "";

  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const mount = mountRef.current;
    if (!src || !mount) {
      setStatus("error");
      return;
    }

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { STLLoader } = await import(
        "three/examples/jsm/loaders/STLLoader.js"
      );
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );
      if (disposed) return;

      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 4000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      mount.appendChild(renderer.domElement);

      // Toon-friendly rig: a strong key, a soft fill, and a cool rim from
      // behind that catches the silhouette for the "techy" edge.
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(0.6, 1, 1.2);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.7);
      fill.position.set(-1, 0.2, 0.6);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0x5ca8ff, 2.2);
      rim.position.set(-0.5, 0.4, -1.4);
      scene.add(rim);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.enableZoom = false;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      controls.autoRotate = !reduceMotion;
      controls.autoRotateSpeed = 1.4;

      const disposables: { dispose(): void }[] = [];
      let raf = 0;

      new STLLoader().load(
        src,
        (geometry) => {
          if (disposed) return;
          geometry.center();
          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          geometry.computeBoundingSphere();
          disposables.push(geometry);

          // Hard-banded ramp → cel shading. NearestFilter keeps the tone
          // steps crisp rather than smoothly blended.
          const tones = new Uint8Array([70, 130, 190, 245]);
          const gradientMap = new THREE.DataTexture(
            tones,
            tones.length,
            1,
            THREE.RedFormat,
          );
          gradientMap.minFilter = THREE.NearestFilter;
          gradientMap.magFilter = THREE.NearestFilter;
          gradientMap.generateMipmaps = false;
          gradientMap.needsUpdate = true;
          disposables.push(gradientMap);

          const material = new THREE.MeshToonMaterial({
            color: 0xcdd4dc,
            gradientMap,
          });
          disposables.push(material);
          const mesh = new THREE.Mesh(geometry, material);

          // Face the broad side at the camera: rotate whichever bounding-box
          // axis is thinnest (the model's "depth") onto +Z, toward the lens.
          const size = new THREE.Vector3();
          geometry.boundingBox!.getSize(size);
          if (size.x <= size.y && size.x <= size.z) {
            mesh.rotation.y = -Math.PI / 2; // X → Z
          } else if (size.y <= size.x && size.y <= size.z) {
            mesh.rotation.x = Math.PI / 2; // Y → Z
          } // else Z is already thinnest — leave it facing forward

          // Comic outline: a black shell rendered on its back faces, scaled
          // just past the surface so only the silhouette rim shows.
          const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.BackSide,
          });
          disposables.push(outlineMaterial);
          const outline = new THREE.Mesh(geometry, outlineMaterial);
          outline.scale.multiplyScalar(1.025);
          mesh.add(outline);

          scene.add(mesh);

          // Frame straight-on so it looks right at the camera.
          const radius = geometry.boundingSphere?.radius ?? 1;
          const dist = radius / Math.sin((camera.fov * Math.PI) / 360);
          camera.position.set(0, 0, dist * 1.15);
          camera.near = dist / 100;
          camera.far = dist * 10;
          camera.updateProjectionMatrix();
          controls.target.set(0, 0, 0);
          controls.update();

          setStatus("ready");
        },
        undefined,
        () => {
          if (!disposed) setStatus("error");
        },
      );

      const animate = () => {
        raf = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const resize = new ResizeObserver(() => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      resize.observe(mount);

      cleanup = () => {
        cancelAnimationFrame(raf);
        resize.disconnect();
        controls.dispose();
        renderer.dispose();
        disposables.forEach((d) => d.dispose());
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [src]);

  return (
    <div className={styles.model}>
      <span className={styles.quoteOrnament} aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <Icon name="Orbit" className={styles.modelIcon} />
      <div
        ref={mountRef}
        className={styles.modelCanvas}
        role="img"
        aria-label="Interactive 3D model — drag to rotate"
      />
      {status !== "ready" && (
        <p className={styles.modelStatus}>
          {status === "error" ? "Model unavailable" : "Loading model…"}
        </p>
      )}
    </div>
  );
}
