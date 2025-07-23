import React, { useState } from 'react';
import ThreeScene from './ThreeScene';

const ThreeDemo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [cameraType, setCameraType] = useState<'perspective' | 'orthographic'>('perspective');
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isVisible && <ThreeScene cameraType={cameraType} isAutoRotate={isAutoRotate} />}
      
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">🎮 Professional 3D Scene with OrbitControls</h1>
          <p className="text-xl mb-6 text-gray-300">
            Experience a fully interactive 3D environment with OrbitControls, dual camera modes, and enhanced rendering!
          </p>
          
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold mb-4">🌟 Advanced Features</h2>
            <ul className="space-y-2 text-gray-300">
              <li>✅ OrbitControls for full camera interaction (drag, zoom, pan)</li>
              <li>✅ Dual camera modes: Perspective & Orthographic</li>
              <li>✅ Enhanced renderer with tone mapping and color space</li>
              <li>✅ Professional lighting with multiple point lights</li>
              <li>✅ High-quality shadow mapping (4096x4096)</li>
              <li>✅ Fog effects for depth perception</li>
              <li>✅ Colored particle system with vertex colors</li>
              <li>✅ Optimized render loop with proper timing</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">🎨 Scene Objects</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>🔵 Blue transparent cube (center)</li>
                <li>🔴 Red metallic sphere (floating)</li>
                <li>🟡 Orange glass torus (rotating)</li>
                <li>🟤 Wooden cylinder (oscillating)</li>
                <li>🟣 Purple cone (dynamic movement)</li>
                <li>⚫ Enhanced ground plane</li>
                <li>✨ Colored particle system</li>
              </ul>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">💡 Advanced Lighting</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>🌅 Ambient light (base illumination)</li>
                <li>☀️ Directional light with shadows</li>
                <li>💚 Green point light (animated)</li>
                <li>💖 Pink point light (animated)</li>
                <li>🎭 High-res shadow maps</li>
                <li>🔍 Proper near/far planes</li>
              </ul>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">🎥 Camera System</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>📷 Perspective camera (60° FOV)</li>
                <li>📐 Orthographic camera option</li>
                <li>🎮 Full OrbitControls support</li>
                <li>🔧 Damping for smooth movement</li>
                <li>📏 Distance limits (3-50 units)</li>
                <li>🔄 Auto-rotation toggle</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold mb-4">🎮 Interactive Controls</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">🎥 Camera Controls</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Camera Type:</label>
                    <select
                      value={cameraType}
                      onChange={(e) => setCameraType(e.target.value as 'perspective' | 'orthographic')}
                      className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="perspective">Perspective Camera</option>
                      <option value="orthographic">Orthographic Camera</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Auto Rotation:</label>
                    <button
                      onClick={() => setIsAutoRotate(!isAutoRotate)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isAutoRotate 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {isAutoRotate ? '🔄 Enabled' : '⏸️ Disabled'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">🎮 Scene Controls</h3>
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={() => setIsVisible(!isVisible)}
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
                    >
                      {isVisible ? '👁️ Hide' : '👁️ Show'} 3D Scene
                    </button>
                  </div>
                  
                  <div className="text-gray-300 text-sm">
                    <p className="mb-2">🎮 Mouse Controls:</p>
                    <ul className="space-y-1">
                      <li>• Left click + drag: Rotate camera</li>
                      <li>• Right click + drag: Pan camera</li>
                      <li>• Scroll wheel: Zoom in/out</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">🚀 Technical Enhancements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">🎯 Renderer Features</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• ACES Filmic tone mapping</li>
                  <li>• SRGB color space</li>
                  <li>• High-performance preference</li>
                  <li>• Optimized pixel ratio</li>
                  <li>• Enhanced antialiasing</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">⚡ Performance Optimizations</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Proper animation frame management</li>
                  <li>• Clock-based timing system</li>
                  <li>• Efficient cleanup on unmount</li>
                  <li>• Responsive window handling</li>
                  <li>• Memory leak prevention</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDemo; 