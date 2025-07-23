import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface ThreeSceneProps {
  cameraType?: 'perspective' | 'orthographic';
  isAutoRotate?: boolean;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  cameraType = 'perspective', 
  isAutoRotate = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50); // Add fog for depth

    // Camera setup with better near/far planes
    let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    
    if (cameraType === 'perspective') {
      camera = new THREE.PerspectiveCamera(
        60, // FOV
        window.innerWidth / window.innerHeight,
        0.1, // Near plane
        1000 // Far plane
      );
      camera.position.set(8, 8, 12);
    } else {
      const aspect = window.innerWidth / window.innerHeight;
      const frustumSize = 10;
      camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1, // Near plane
        1000 // Far plane
      );
      camera.position.set(8, 8, 12);
    }
    
    camera.lookAt(0, 0, 0);

    // Renderer setup with enhanced settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    mountRef.current.appendChild(renderer.domElement);

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(15, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 1, 100);
    pointLight1.position.set(-8, 8, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff0088, 0.8, 80);
    pointLight2.position.set(8, -8, -8);
    scene.add(pointLight2);

    // Create main object group
    const mainGroup = new THREE.Group();

    // Enhanced cube with better material
    const cubeGeometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const cubeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4a90e2,
      shininess: 120,
      transparent: true,
      opacity: 0.85,
      specular: 0x444444
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.receiveShadow = true;
    mainGroup.add(cube);

    // Enhanced sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const sphereMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xe74c3c,
      shininess: 250,
      transparent: true,
      opacity: 0.9,
      specular: 0x666666
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(5, 0, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    mainGroup.add(sphere);

    // Enhanced torus
    const torusGeometry = new THREE.TorusGeometry(2, 0.6, 32, 128);
    const torusMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xf39c12,
      shininess: 180,
      transparent: true,
      opacity: 0.8,
      specular: 0x555555
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-5, 0, 0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    mainGroup.add(torus);

    // Enhanced cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 4, 64);
    const cylinderMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8b4513,
      shininess: 80,
      specular: 0x333333
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(0, 6, 0);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    mainGroup.add(cylinder);

    // Add cone for variety
    const coneGeometry = new THREE.ConeGeometry(1.2, 3, 64);
    const coneMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x9b59b6,
      shininess: 150,
      transparent: true,
      opacity: 0.85,
      specular: 0x444444
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(0, -6, 0);
    cone.castShadow = true;
    cone.receiveShadow = true;
    mainGroup.add(cone);

    scene.add(mainGroup);

    // Enhanced ground plane
    const planeGeometry = new THREE.PlaneGeometry(30, 30, 32, 32);
    const planeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2c3e50,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -8;
    plane.receiveShadow = true;
    scene.add(plane);

    // Enhanced particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 30;
      posArray[i + 1] = (Math.random() - 0.5) * 30;
      posArray[i + 2] = (Math.random() - 0.5) * 30;
      
      colorArray[i] = Math.random();
      colorArray[i + 1] = Math.random();
      colorArray[i + 2] = Math.random();
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Enhanced render loop with proper timing
    let animationId: number;
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Update controls
      controls.update();

      // Enhanced object animations
      mainGroup.rotation.y += 0.003;
      mainGroup.rotation.x += 0.001;

      // Individual object animations with time-based movement
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      
      sphere.rotation.y += 0.015;
      sphere.position.y = Math.sin(elapsedTime * 0.8) * 0.8;
      
      torus.rotation.x += 0.012;
      torus.rotation.z += 0.008;
      
      cylinder.rotation.y += 0.006;
      cylinder.position.x = Math.sin(elapsedTime * 0.6) * 0.5;

      cone.rotation.y += 0.01;
      cone.position.z = Math.sin(elapsedTime * 0.7) * 0.6;

      // Animate particles
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0003;

      // Animate lights for dynamic effect
      pointLight1.position.x = Math.sin(elapsedTime * 0.3) * 10;
      pointLight1.position.z = Math.cos(elapsedTime * 0.3) * 10;
      
      pointLight2.position.x = Math.sin(elapsedTime * 0.2 + Math.PI) * 8;
      pointLight2.position.z = Math.cos(elapsedTime * 0.2 + Math.PI) * 8;

      renderer.render(scene, camera);
    };

    animate();

    // Enhanced window resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
      } else if (camera instanceof THREE.OrthographicCamera) {
        const aspect = width / height;
        const frustumSize = 10;
        camera.left = frustumSize * aspect / -2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = frustumSize / -2;
      }
      
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [cameraType, isAutoRotate]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1
      }} 
    />
  );
};

export default ThreeScene; 