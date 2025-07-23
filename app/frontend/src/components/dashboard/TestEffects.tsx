import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface TestEffectsProps {
  darkMode?: boolean;
}

const TestEffects: React.FC<TestEffectsProps> = ({ darkMode = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('TestEffects: Initializing Three.js scene...');

    // Scene setup with very dark background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(darkMode ? 0x020202 : 0x050505); // Even darker for dark mode
    scene.fog = new THREE.Fog(darkMode ? 0x020202 : 0x050505, 8, 40); // Closer fog for more dramatic effect
    
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
    renderer.toneMappingExposure = darkMode ? 1.0 : 0.8; // Brighter for dark mode
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0.2);
    
    mountRef.current.appendChild(renderer.domElement);
    console.log('TestEffects: Renderer added to DOM');

    // Create multiple geometric shapes for cooler effect
    const shapes: THREE.Mesh[] = [];
    const colors = darkMode 
      ? [0x00ff88, 0xff0088, 0x0088ff, 0xff8800, 0x8800ff, 0x00ffff] // Bright neon colors for dark mode
      : [0x0066cc, 0xcc0066, 0x0066cc, 0xcc6600, 0x6600cc, 0x00cccc]; // Softer colors for light mode
    
    for (let i = 0; i < 12; i++) {
      let geometry: THREE.BufferGeometry;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Randomly choose geometry type
      const geometryType = Math.floor(Math.random() * 4);
      switch (geometryType) {
        case 0:
          geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
          break;
        case 1:
          geometry = new THREE.SphereGeometry(0.8, 32, 32);
          break;
        case 2:
          geometry = new THREE.TorusGeometry(0.8, 0.3, 16, 32);
          break;
        case 3:
          geometry = new THREE.ConeGeometry(0.8, 1.5, 16);
          break;
        default:
          geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      }
      
      const material = new THREE.MeshPhongMaterial({ 
        color,
        transparent: true,
        opacity: darkMode ? 0.9 : 0.85, // Higher opacity for dark mode
        shininess: 200
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Random position
      mesh.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15
      );
      
      // Random rotation
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      // Store animation properties
      (mesh as any).originalPosition = mesh.position.clone();
      (mesh as any).originalRotation = mesh.rotation.clone();
      (mesh as any).animationSpeed = Math.random() * 0.02 + 0.01;
      (mesh as any).floatSpeed = Math.random() * 0.01 + 0.005;
      
      shapes.push(mesh);
      scene.add(mesh);
    }
    console.log('TestEffects: Shapes added to scene');

    // Add dramatic lighting
    const ambientLight = new THREE.AmbientLight(darkMode ? 0x101010 : 0x202020, darkMode ? 0.1 : 0.2); // Darker ambient for dark mode
    scene.add(ambientLight);

    // Add multiple colored point lights for dramatic effect
    const lights: THREE.PointLight[] = [];
    const lightColors = darkMode 
      ? [0x00ff88, 0xff0088, 0x0088ff, 0xff8800] // Bright neon colors
      : [0x0066cc, 0xcc0066, 0x0066cc, 0xcc6600]; // Softer colors
    
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(lightColors[i], darkMode ? 2.5 : 2.0, 25); // Stronger lights for dark mode
      light.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        10
      );
      lights.push(light);
      scene.add(light);
    }

    // Create particle system for atmosphere
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = darkMode ? 500 : 400; // More particles for dark mode
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 60;
      posArray[i + 1] = (Math.random() - 0.5) * 60;
      posArray[i + 2] = (Math.random() - 0.5) * 30;
      
      // Neon-like colors for dark mode, softer for light mode
      if (darkMode) {
        colorArray[i] = Math.random() * 0.8 + 0.2; // R
        colorArray[i + 1] = Math.random() * 0.8 + 0.2; // G
        colorArray[i + 2] = Math.random() * 0.8 + 0.2; // B
      } else {
        colorArray[i] = Math.random() * 0.6 + 0.4; // R
        colorArray[i + 1] = Math.random() * 0.6 + 0.4; // G
        colorArray[i + 2] = Math.random() * 0.6 + 0.4; // B
      }
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: darkMode ? 0.15 : 0.12, // Larger particles for dark mode
      vertexColors: true,
      transparent: true,
      opacity: darkMode ? 0.8 : 0.7, // Higher opacity for dark mode
      sizeAttenuation: true
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create dark wave effect
    const waveGeometry = new THREE.PlaneGeometry(50, 50, 80, 80);
    const waveMaterial = new THREE.MeshPhongMaterial({
      color: darkMode ? 0x00ff88 : 0x0066cc, // Brighter for dark mode
      transparent: true,
      opacity: darkMode ? 0.15 : 0.1, // Higher opacity for dark mode
      wireframe: true,
      side: THREE.DoubleSide
    });
    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    waveMesh.rotation.x = -Math.PI / 2;
    waveMesh.position.y = -15;
    scene.add(waveMesh);

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      // Animate shapes
      shapes.forEach((shape, index) => {
        const originalPos = (shape as any).originalPosition;
        const originalRot = (shape as any).originalRotation;
        const animSpeed = (shape as any).animationSpeed;
        const floatSpeed = (shape as any).floatSpeed;
        
        // Floating motion
        shape.position.y = originalPos.y + Math.sin(elapsedTime * floatSpeed + index) * 1.5;
        shape.position.x = originalPos.x + Math.cos(elapsedTime * floatSpeed * 0.7 + index) * 1;
        
        // Rotation
        shape.rotation.x = originalRot.x + elapsedTime * animSpeed;
        shape.rotation.y = originalRot.y + elapsedTime * animSpeed * 0.7;
        shape.rotation.z = originalRot.z + elapsedTime * animSpeed * 0.5;
        
        // Pulse effect
        const scale = 1 + Math.sin(elapsedTime * 2 + index) * 0.3;
        shape.scale.set(scale, scale, scale);
      });

      // Animate lights
      lights.forEach((light, index) => {
        light.position.x = Math.sin(elapsedTime * 0.3 + index) * 15;
        light.position.y = Math.cos(elapsedTime * 0.2 + index) * 15;
        light.intensity = (darkMode ? 2.5 : 2.0) + Math.sin(elapsedTime * 1.5 + index) * 0.5;
      });

      // Animate particles
      particlesMesh.rotation.y += 0.0008;
      particlesMesh.rotation.x += 0.0004;

      // Animate wave
      const positions = waveGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] = Math.sin(x * 0.2 + elapsedTime) * 2 + Math.sin(z * 0.15 + elapsedTime * 0.6) * 1;
      }
      waveGeometry.attributes.position.needsUpdate = true;

      // Subtle camera movement
      camera.position.x = Math.sin(elapsedTime * 0.1) * 1.5;
      camera.position.y = Math.cos(elapsedTime * 0.08) * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();
    console.log('TestEffects: Animation started');

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('TestEffects: Cleaning up...');
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [darkMode]); // Add darkMode to dependency array

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

export default TestEffects; 