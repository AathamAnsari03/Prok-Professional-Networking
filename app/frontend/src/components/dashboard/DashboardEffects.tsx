import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const DashboardEffects: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e); // Dark blue background
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
    
    // Renderer setup with enhanced settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    mountRef.current.appendChild(renderer.domElement);

    // Create floating geometric shapes
    const shapes: THREE.Mesh[] = [];
    const colors = [0x4a90e2, 0xe74c3c, 0xf39c12, 0x9b59b6, 0x2ecc71, 0xe67e22];
    
    // Add multiple geometric shapes
    for (let i = 0; i < 20; i++) {
      let geometry: THREE.BufferGeometry;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Randomly choose geometry type
      const geometryType = Math.floor(Math.random() * 4);
      switch (geometryType) {
        case 0:
          geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
        case 1:
          geometry = new THREE.SphereGeometry(0.6, 32, 32);
          break;
        case 2:
          geometry = new THREE.TorusGeometry(0.6, 0.2, 16, 32);
          break;
        case 3:
          geometry = new THREE.ConeGeometry(0.6, 1.2, 16);
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }
      
      const material = new THREE.MeshPhongMaterial({ 
        color,
        transparent: true,
        opacity: 0.8,
        shininess: 150
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Random position - spread them out more
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15
      );
      
      // Random rotation
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      // Store original position for animation
      (mesh as any).originalPosition = mesh.position.clone();
      (mesh as any).originalRotation = mesh.rotation.clone();
      (mesh as any).animationSpeed = Math.random() * 0.03 + 0.02;
      (mesh as any).floatSpeed = Math.random() * 0.015 + 0.01;
      
      shapes.push(mesh);
      scene.add(mesh);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Add multiple point lights for dynamic lighting
    const lights: THREE.PointLight[] = [];
    const lightColors = [0x4a90e2, 0xe74c3c, 0xf39c12, 0x9b59b6];
    
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(lightColors[i], 1.2, 20);
      light.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        8
      );
      lights.push(light);
      scene.add(light);
    }

    // Create particle system for background effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 50;
      posArray[i + 1] = (Math.random() - 0.5) * 50;
      posArray[i + 2] = (Math.random() - 0.5) * 25;
      
      // More vibrant colors
      colorArray[i] = Math.random() * 0.5 + 0.5; // R
      colorArray[i + 1] = Math.random() * 0.5 + 0.5; // G
      colorArray[i + 2] = Math.random() * 0.5 + 0.5; // B
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create wave effect
    const waveGeometry = new THREE.PlaneGeometry(40, 40, 60, 60);
    const waveMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
      side: THREE.DoubleSide
    });
    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    waveMesh.rotation.x = -Math.PI / 2;
    waveMesh.position.y = -12;
    scene.add(waveMesh);

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = clock.getDelta();

      // Animate shapes
      shapes.forEach((shape, index) => {
        const originalPos = (shape as any).originalPosition;
        const originalRot = (shape as any).originalRotation;
        const animSpeed = (shape as any).animationSpeed;
        const floatSpeed = (shape as any).floatSpeed;
        
        // Floating motion
        shape.position.y = originalPos.y + Math.sin(elapsedTime * floatSpeed + index) * 1;
        shape.position.x = originalPos.x + Math.cos(elapsedTime * floatSpeed * 0.7 + index) * 0.8;
        
        // Rotation
        shape.rotation.x = originalRot.x + elapsedTime * animSpeed;
        shape.rotation.y = originalRot.y + elapsedTime * animSpeed * 0.7;
        shape.rotation.z = originalRot.z + elapsedTime * animSpeed * 0.5;
        
        // Pulse effect
        const scale = 1 + Math.sin(elapsedTime * 2 + index) * 0.2;
        shape.scale.set(scale, scale, scale);
      });

      // Animate lights
      lights.forEach((light, index) => {
        light.position.x = Math.sin(elapsedTime * 0.4 + index) * 12;
        light.position.y = Math.cos(elapsedTime * 0.3 + index) * 12;
        light.intensity = 0.8 + Math.sin(elapsedTime * 2 + index) * 0.4;
      });

      // Animate particles
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      // Animate wave
      const positions = waveGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] = Math.sin(x * 0.3 + elapsedTime) * 1 + Math.sin(z * 0.2 + elapsedTime * 0.8) * 0.5;
      }
      waveGeometry.attributes.position.needsUpdate = true;

      // Subtle camera movement
      camera.position.x = Math.sin(elapsedTime * 0.15) * 1;
      camera.position.y = Math.cos(elapsedTime * 0.1) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }} 
    />
  );
};

export default DashboardEffects; 