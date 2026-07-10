import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeRoutingHub() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#020208", 0.05);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold everything
    const hubGroup = new THREE.Group();
    scene.add(hubGroup);

    // Define department nodes (locations around the central router)
    const departments = [
      { name: "Government/Municipal", pos: new THREE.Vector3(-4, 3, 0), color: 0x06b6d4, icon: "🏛️" }, // Cyan
      { name: "Hospitals/Healthcare", pos: new THREE.Vector3(4, 2.5, 1), color: 0x10b981, icon: "🏥" }, // Emerald
      { name: "IT Companies/Support", pos: new THREE.Vector3(-4.5, -2, 2), color: 0x6366f1, icon: "💻" }, // Indigo
      { name: "Banks/Finance", pos: new THREE.Vector3(3.5, -3, 0), color: 0xf59e0b, icon: "🏦" }, // Amber
      { name: "Railways/Transport", pos: new THREE.Vector3(0, -4.5, -1), color: 0xec4899, icon: "🚆" }, // Pink
      { name: "Universities/Edu", pos: new THREE.Vector3(0, 4.5, -2), color: 0x8b5cf6, icon: "🎓" }, // Purple
    ];

    const centralPos = new THREE.Vector3(0, 0, 0);

    // 1. Create Central AI Routing core mesh
    const centralGeom = new THREE.OctahedronGeometry(1.6, 2);
    const centralMat = new THREE.MeshPhongMaterial({
      color: 0x6366f1,
      emissive: 0x312e81,
      shininess: 80,
      transparent: true,
      opacity: 0.9,
      flatShading: true
    });
    const centralNode = new THREE.Mesh(centralGeom, centralMat);
    hubGroup.add(centralNode);

    // Wireframe surrounding central node
    const centralWireGeom = new THREE.OctahedronGeometry(1.65, 1);
    const centralWireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const centralWire = new THREE.Mesh(centralWireGeom, centralWireMat);
    hubGroup.add(centralWire);

    // 2. Create department node spheres & connection wires
    const deptMeshes: THREE.Mesh[] = [];
    const connectionLines: THREE.Line[] = [];
    
    // For ticket simulation, we'll track moving particle beads
    const tickets: Array<{
      currentPos: THREE.Vector3;
      source: THREE.Vector3;
      target: THREE.Vector3;
      progress: number;
      speed: number;
      color: number;
      mesh: THREE.Mesh;
    }> = [];

    // Simple glowing ticket particle sphere template
    const ticketGeom = new THREE.SphereGeometry(0.12, 8, 8);

    departments.forEach((dept) => {
      // Create outer glassmorphic sphere
      const deptGeom = new THREE.SphereGeometry(0.7, 16, 16);
      const deptMat = new THREE.MeshPhongMaterial({
        color: dept.color,
        emissive: dept.color,
        emissiveIntensity: 0.2,
        shininess: 40,
        transparent: true,
        opacity: 0.5,
        wireframe: false,
      });
      const deptMesh = new THREE.Mesh(deptGeom, deptMat);
      deptMesh.position.copy(dept.pos);
      hubGroup.add(deptMesh);
      deptMeshes.push(deptMesh);

      // Create an inner wireframe ring / mesh for visual complexity
      const innerGeom = new THREE.TorusGeometry(0.85, 0.03, 8, 24);
      const innerMat = new THREE.MeshBasicMaterial({
        color: dept.color,
        transparent: true,
        opacity: 0.3,
      });
      const innerRing = new THREE.Mesh(innerGeom, innerMat);
      innerRing.position.copy(dept.pos);
      innerRing.rotation.x = Math.random() * Math.PI;
      innerRing.rotation.y = Math.random() * Math.PI;
      hubGroup.add(innerRing);

      // Create neon connection path from Central Core to Department
      const curve = new THREE.CatmullRomCurve3([
        centralPos,
        // Add a curved middle waypoint to make connections organic and cybernetic
        new THREE.Vector3()
          .addVectors(centralPos, dept.pos)
          .multiplyScalar(0.5)
          .add(new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5)),
        dept.pos,
      ]);

      const points = curve.getPoints(30);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: dept.color,
        transparent: true,
        opacity: 0.25,
      });
      const connectionLine = new THREE.Line(lineGeom, lineMat);
      hubGroup.add(connectionLine);
      connectionLines.push(connectionLine);

      // Spawn 2 concurrent simulated tickets traveling on this path
      for (let k = 0; k < 2; k++) {
        const ticketMat = new THREE.MeshBasicMaterial({
          color: dept.color,
          transparent: true,
          opacity: 0.9,
        });
        const ticketMesh = new THREE.Mesh(ticketGeom, ticketMat);
        ticketMesh.position.copy(centralPos);
        hubGroup.add(ticketMesh);

        tickets.push({
          currentPos: new THREE.Vector3().copy(centralPos),
          source: centralPos,
          target: dept.pos,
          progress: Math.random(), // Stagger positions
          speed: 0.006 + Math.random() * 0.008,
          color: dept.color,
          mesh: ticketMesh,
        });
      }
    });

    // 3. Ambient general cosmic particles
    const particleCount = 100;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 18;
    }
    particlesGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.55,
    });
    const generalParticles = new THREE.Points(particlesGeom, particlesMat);
    hubGroup.add(generalParticles);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0e0e29, 2);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x6366f1, 10, 15);
    scene.add(coreLight);

    const cornerLight = new THREE.DirectionalLight(0x06b6d4, 1.5);
    cornerLight.position.set(5, 5, 5);
    scene.add(cornerLight);

    // Parallax tracking variables
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
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

    const resizeObserver = new ResizeObserver(() => {
      onResize();
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Rotations
      centralNode.rotation.y += 0.005;
      centralNode.rotation.x += 0.003;
      centralWire.rotation.y -= 0.003;

      // Pulse Central Node Scale
      const scale = 1 + Math.sin(elapsedTime * 3) * 0.05;
      centralNode.scale.set(scale, scale, scale);

      // Animate department nodes
      deptMeshes.forEach((mesh, index) => {
        mesh.rotation.y += 0.01;
        // Subtle floating motion
        mesh.position.y = departments[index].pos.y + Math.sin(elapsedTime * 1.5 + index) * 0.12;
      });

      // Animate Ticket Flow particles between central core and depts
      tickets.forEach((ticket) => {
        ticket.progress += ticket.speed;
        
        // Loop ticket progression
        if (ticket.progress > 1) {
          ticket.progress = 0;
          ticket.currentPos.copy(ticket.source);
        }

        // Interpolate along straight or curved lines smoothly
        ticket.currentPos.lerpVectors(ticket.source, ticket.target, ticket.progress);
        
        // Add tiny float offset to make it look dynamic
        const progressSin = Math.sin(ticket.progress * Math.PI);
        ticket.mesh.position.set(
          ticket.currentPos.x + Math.sin(elapsedTime * 6 + ticket.progress * 10) * 0.1 * progressSin,
          ticket.currentPos.y + Math.cos(elapsedTime * 6 + ticket.progress * 10) * 0.1 * progressSin,
          ticket.currentPos.z
        );

        // Scale ticket based on proximity to center/dest
        const ticketScale = 0.6 + progressSin * 0.8;
        ticket.mesh.scale.set(ticketScale, ticketScale, ticketScale);
      });

      // Subtle rotation of general star particles
      generalParticles.rotation.y += 0.0005;

      // Mouse Parallax camera ease
      const parallaxX = targetX * 1.2;
      const parallaxY = -targetY * 1.2;
      hubGroup.rotation.y += (parallaxX - hubGroup.rotation.y) * 0.05;
      hubGroup.rotation.x += (parallaxY - hubGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      // Memory cleanup
      centralGeom.dispose();
      centralMat.dispose();
      centralWireGeom.dispose();
      centralWireMat.dispose();
      ticketGeom.dispose();
      deptMeshes.forEach((m) => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else m.material.dispose();
      });
      connectionLines.forEach((l) => {
        l.geometry.dispose();
        if (Array.isArray(l.material)) l.material.forEach((mat) => mat.dispose());
        else l.material.dispose();
      });
      tickets.forEach((t) => {
        t.mesh.geometry.dispose();
        if (Array.isArray(t.mesh.material)) t.mesh.material.forEach((mat) => mat.dispose());
        else t.mesh.material.dispose();
      });
      particlesGeom.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px] md:min-h-[550px]" id="three-routing-hub-container" />;
}
