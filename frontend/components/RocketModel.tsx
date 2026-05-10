'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface RocketModelProps {
  width?: string | number;
  height?: number;
}

type FlameParticle = THREE.Mesh & {
  userData: {
    speed: number;
    offset: number;
    startY: number;
    life: number;
  };
};

function makeFin(angleY: number, material: THREE.Material) {
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0.55, -0.4);
  finShape.lineTo(0.55, -0.9);
  finShape.lineTo(0, -0.6);
  finShape.closePath();

  const geometry = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelSize: 0.02,
    bevelThickness: 0.02,
    bevelSegments: 2,
  });

  const fin = new THREE.Mesh(geometry, material);
  fin.position.set(0.4, -1.0, -0.03);

  const group = new THREE.Group();
  group.add(fin);
  group.rotation.y = angleY;
  return group;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
      return;
    }

    if (material) {
      material.dispose();
    }
  });
}

export default function RocketModel({ width = '100%', height = 520 }: RocketModelProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x070816, 8, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    (renderer as THREE.WebGLRenderer & { outputEncoding: number }).outputEncoding = (THREE as any).sRGBEncoding;
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.15, 6);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const purpleLight = new THREE.PointLight(0xa855f7, 3, 18);
    purpleLight.position.set(-3, 3, 3);
    const orangeLight = new THREE.PointLight(0xf97316, 2, 18);
    orangeLight.position.set(3, -2, 2);
    const whiteLight = new THREE.DirectionalLight(0xffffff, 0.6);
    whiteLight.position.set(0, 5, 5);

    scene.add(ambientLight, purpleLight, orangeLight, whiteLight);

    const rocketGroup = new THREE.Group();
    rocketGroup.scale.setScalar(0.8);
    rocketGroup.position.y = 0.08;
    scene.add(rocketGroup);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe8e8f0, roughness: 0.3, metalness: 0.5 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, metalness: 0.6 });
    const finMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3, metalness: 0.4 });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.1,
      metalness: 0.1,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.4,
    });
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.8 });
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.3,
    });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 2.2, 32), bodyMat);
    body.position.y = 0;
    rocketGroup.add(body);

    const noseCone = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.38, 1.1, 32), noseMat);
    noseCone.position.y = 1.65;
    rocketGroup.add(noseCone);

    const noseCap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), noseMat);
    noseCap.position.y = 2.15;
    rocketGroup.add(noseCap);

    const bottomSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.3, 32), bodyMat);
    bottomSkirt.position.y = -1.25;
    rocketGroup.add(bottomSkirt);

    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.4, 32), nozzleMat);
    nozzle.position.y = -1.6;
    rocketGroup.add(nozzle);

    const nozzleBell = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 0.22, 32), nozzleMat);
    nozzleBell.position.y = -1.88;
    rocketGroup.add(nozzleBell);

    const porthole = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), windowMat);
    porthole.position.set(0.38, 0.25, 0.12);
    rocketGroup.add(porthole);

    const windowRim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 24), rimMat);
    windowRim.position.set(0.38, 0.25, 0.12);
    windowRim.rotation.y = Math.PI / 2;
    rocketGroup.add(windowRim);

    for (let index = 0; index < 4; index += 1) {
      rocketGroup.add(makeFin((index / 4) * Math.PI * 2, finMat));
    }

    const flameGroup = new THREE.Group();
    flameGroup.position.y = -2.1;
    rocketGroup.add(flameGroup);

    const flameColors = [0xf97316, 0xfbbf24, 0xfb923c, 0xef4444, 0xfde68a];
    for (let index = 0; index < 40; index += 1) {
      const geometry = new THREE.SphereGeometry(Math.random() * 0.08 + 0.03, 6, 6);
      const material = new THREE.MeshBasicMaterial({
        color: flameColors[Math.floor(Math.random() * flameColors.length)],
        transparent: true,
        opacity: Math.random() * 0.8 + 0.2,
      });

      const particle = new THREE.Mesh(geometry, material) as unknown as FlameParticle;
      particle.userData = {
        speed: Math.random() * 0.04 + 0.02,
        offset: Math.random() * Math.PI * 2,
        startY: -2.1 - Math.random() * 0.6,
        life: Math.random(),
      };
      particle.position.set((Math.random() - 0.5) * 0.25, particle.userData.startY, (Math.random() - 0.5) * 0.25);
      flameGroup.add(particle);
    }

    const starVertices: number[] = [];
    for (let index = 0; index < 300; index += 1) {
      starVertices.push((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.7 }),
    );
    scene.add(stars);

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotVel = { x: 0, y: 0 };
    let rotX = 0.15;
    let rotY = 0;
    let autoSpin = 0;
    let zoom = 6;
    let frame = 0;
    let rafId = 0;

    const resize = () => {
      const widthPx = mount.clientWidth;
      const heightPx = mount.clientHeight;
      renderer.setSize(widthPx, heightPx, false);
      camera.aspect = widthPx / heightPx;
      camera.updateProjectionMatrix();
    };

    const updatePointer = (event: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - prevMouse.x;
      const deltaY = event.clientY - prevMouse.y;
      rotVel.y = deltaX * 0.012;
      rotVel.x = deltaY * 0.012;
      prevMouse = { x: event.clientX, y: event.clientY };
    };

    const handlePointerDown = (event: PointerEvent) => {
      isDragging = true;
      prevMouse = { x: event.clientX, y: event.clientY };
      mount.style.cursor = 'grabbing';
      mount.setPointerCapture(event.pointerId);
    };

    const handlePointerUp = (event: PointerEvent) => {
      isDragging = false;
      mount.style.cursor = 'grab';
      if (mount.hasPointerCapture(event.pointerId)) {
        mount.releasePointerCapture(event.pointerId);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoom = THREE.MathUtils.clamp(zoom + event.deltaY * 0.0025, 3.6, 9);
    };

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      frame += 1;

      if (!isDragging) {
        rotVel.x *= 0.94;
        rotVel.y *= 0.94;
      }

      rotX = THREE.MathUtils.clamp(rotX + rotVel.x, -0.8, 0.9);
      rotY += rotVel.y;
      autoSpin += 0.005;

      rocketGroup.rotation.x = rotX;
      rocketGroup.rotation.y = rotY + autoSpin;
      rocketGroup.rotation.z = -Math.PI / 4;

      camera.position.set(0, 0.15, zoom);
      camera.lookAt(0, 0, 0);

      purpleLight.intensity = 2.5 + Math.sin(frame * 0.04) * 0.8;
      orangeLight.intensity = 1.8 + Math.sin(frame * 0.03 + 1) * 0.5;
      stars.rotation.y += 0.0002;

      flameGroup.children.forEach((child) => {
        const particle = child as FlameParticle;
        particle.userData.life -= particle.userData.speed;

        if (particle.userData.life <= 0) {
          particle.userData.life = 1;
          particle.position.set(
            (Math.random() - 0.5) * 0.25,
            particle.userData.startY,
            (Math.random() - 0.5) * 0.25,
          );
        }

        particle.position.y -= particle.userData.speed * 0.6;
        particle.position.x += Math.sin(frame * 0.05 + particle.userData.offset) * 0.003;
        const material = particle.material as THREE.MeshBasicMaterial;
        material.opacity = particle.userData.life * 0.9;
        const scale = particle.userData.life * 0.8 + 0.2;
        particle.scale.setScalar(scale);
      });

      renderer.render(scene, camera);
    };

    resize();
    window.addEventListener('resize', resize);
    mount.addEventListener('pointerdown', handlePointerDown);
    mount.addEventListener('pointermove', updatePointer);
    window.addEventListener('pointerup', handlePointerUp);
    mount.addEventListener('wheel', handleWheel, { passive: false });
    mount.style.cursor = 'grab';

    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      mount.removeEventListener('pointerdown', handlePointerDown);
      mount.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('pointerup', handlePointerUp);
      mount.removeEventListener('wheel', handleWheel);
      disposeObject(rocketGroup);
      disposeObject(stars);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: `${height}px`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        background: '#070816',
        touchAction: 'none',
      }}
      aria-label="Interactive 3D rocket model"
    />
  );
}