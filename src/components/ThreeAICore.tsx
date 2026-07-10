import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeAICore() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#020208", 0.045);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 15;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Group to hold everything for easy parallax
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Crystalline Core (Icosahedron + Wireframe Overlay)
    const coreGeometry = new THREE.IcosahedronGeometry(2.5, 1);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x6366f1, // Indigo
      emissive: 0x4338ca,
      shininess: 100,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(coreMesh);

    // Outer wireframe core for the cyber tech aesthetic
    const wireframeGeometry = new THREE.IcosahedronGeometry(2.52, 1);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    mainGroup.add(wireframeMesh);

    // 2. Holographic Orbit Rings
    const ringCount = 3;
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < ringCount; i++) {
      const radius = 4 + i * 1.5;
      const ringGeometry = new THREE.TorusGeometry(radius, 0.04, 8, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x6366f1 : 0xa855f7, // Alternate Indigo / Purple
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      // Random initial rotations
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      mainGroup.add(ring);
      rings.push(ring);
    }

    // 3. Floating Ticket Flows (Particle stream flowing towards the AI Core)
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Store particle velocity, distance, angles for animation
    const particlesData: Array<{
      radius: number;
      speed: number;
      angle: number;
      yOffset: number;
      colorType: "cyan" | "indigo" | "purple";
    }> = [];

    const cyanColor = new THREE.Color(0x06b6d4);
    const indigoColor = new THREE.Color(0x6366f1);
    const purpleColor = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount; i++) {
      // Tickets flow inwards starting from radius 12-18 down to 2.5
      const startRadius = 5 + Math.random() * 12;
      const startAngle = Math.random() * Math.PI * 2;
      const startY = (Math.random() - 0.5) * 6;

      positions[i * 3] = Math.cos(startAngle) * startRadius;
      positions[i * 3 + 1] = startY;
      positions[i * 3 + 2] = Math.sin(startAngle) * startRadius;

      // Color coding
      const rand = Math.random();
      let selectedColor = indigoColor;
      let colorType: "cyan" | "indigo" | "purple" = "indigo";
      if (rand < 0.35) {
        selectedColor = cyanColor;
        colorType = "cyan";
      } else if (rand > 0.7) {
        selectedColor = purpleColor;
        colorType = "purple";
      }

      colors[i * 3] = selectedColor.r;
      colors[i * 3 + 1] = selectedColor.g;
      colors[i * 3 + 2] = selectedColor.b;

      particlesData.push({
        radius: startRadius,
        speed: 0.02 + Math.random() * 0.04,
        angle: startAngle,
        yOffset: startY,
        colorType,
      });
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Glowy round texture using a simple Canvas sprite
    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.3, "rgba(99, 102, 241, 0.8)");
        grad.addColorStop(1, "rgba(99, 102, 241, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.35,
      map: createParticleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particleSystem);

    // 4. Floating Geometric Shapes in background
    const shapesGroup = new THREE.Group();
    mainGroup.add(shapesGroup);
    const shapeGeometries = [
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.TetrahedronGeometry(0.4),
      new THREE.OctahedronGeometry(0.45),
    ];

    const shapes: Array<{
      mesh: THREE.Mesh;
      rotSpeedX: number;
      rotSpeedY: number;
      floatSpeed: number;
      floatOffset: number;
    }> = [];

    for (let i = 0; i < 25; i++) {
      const geom = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)];
      const mat = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 0x6366f1 : 0x06b6d4,
        emissive: i % 2 === 0 ? 0x312e81 : 0x083344,
        transparent: true,
        opacity: 0.25,
        wireframe: Math.random() > 0.5,
      });

      const mesh = new THREE.Mesh(geom, mat);
      const dist = 8 + Math.random() * 12;
      const angle = Math.random() * Math.PI * 2;
      mesh.position.set(
        Math.cos(angle) * dist,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 15 - 5
      );

      shapesGroup.add(mesh);
      shapes.push({
        mesh,
        rotSpeedX: 0.005 + Math.random() * 0.015,
        rotSpeedY: 0.005 + Math.random() * 0.015,
        floatSpeed: 0.001 + Math.random() * 0.003,
        floatOffset: Math.random() * 100,
      });
    }

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a0a23, 1.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 15, 30);
    pointLight1.position.set(0, 0, 0); // At core center
    scene.add(pointLight1);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 2.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    // Interactive mouse parallax variables
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    window.addEventListener("mousemove", onMouseMove);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Resize Observer for the container size changes
    const resizeObserver = new ResizeObserver(() => {
      onResize();
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Rotations
      coreMesh.rotation.y += 0.008;
      coreMesh.rotation.x += 0.004;

      wireframeMesh.rotation.y -= 0.005;
      wireframeMesh.rotation.x += 0.0025;

      // Animate Orbit Rings
      rings.forEach((ring, index) => {
        const factor = index % 2 === 0 ? 1 : -1;
        ring.rotation.x += 0.002 * factor;
        ring.rotation.y += 0.003 * factor;
        ring.rotation.z += 0.001 * factor;
      });

      // Animate Ticket Flow Particles
      const positionsAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = positionsAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const data = particlesData[i];
        
        // Circular orbit collapsing into center
        data.radius -= data.speed;
        data.angle += 0.015; // Spiral orbit speed

        // If ticket hits core, respawn outside
        if (data.radius < 1.8) {
          data.radius = 12 + Math.random() * 6;
          data.angle = Math.random() * Math.PI * 2;
          data.yOffset = (Math.random() - 0.5) * 5;
        }

        posArray[i * 3] = Math.cos(data.angle) * data.radius;
        posArray[i * 3 + 1] = data.yOffset + Math.sin(elapsedTime + i) * 0.15;
        posArray[i * 3 + 2] = Math.sin(data.angle) * data.radius;
      }
      positionsAttr.needsUpdate = true;

      // Pulsing lights
      pointLight1.intensity = 15 + Math.sin(elapsedTime * 4) * 5;

      // Animate Background Shapes
      shapes.forEach((item) => {
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;
        // Float up and down
        item.mesh.position.y += Math.sin(elapsedTime * 0.5 + item.floatOffset) * item.floatSpeed;
      });

      // Smooth mouse parallax camera response
      const parallaxX = targetX * 1.5;
      const parallaxY = -targetY * 1.5;

      mainGroup.rotation.y += (parallaxX - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (parallaxY - mainGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Dispose materials & geometries
      coreGeometry.dispose();
      coreMaterial.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      shapes.forEach((item) => {
        item.mesh.geometry.dispose();
        if (Array.isArray(item.mesh.material)) {
          item.mesh.material.forEach((mat) => mat.dispose());
        } else {
          item.mesh.material.dispose();
        }
      });
      rings.forEach((ring) => {
        ring.geometry.dispose();
        if (Array.isArray(ring.material)) {
          ring.material.forEach((m) => m.dispose());
        } else {
          ring.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[350px] md:min-h-[500px]" id="three-ai-core-container" />;
}
