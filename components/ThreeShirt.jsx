"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Center, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useSettings } from "../contexts/SettingsContext";

// Bible verses for the back of each shirt
const BIBLE_VERSES = {
  wine: '"For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11',
  white:
    '"I can do all things through Christ who strengthens me." - Philippians 4:13',
  black:
    '"Trust in the LORD with all your heart and lean not on your own understanding." - Proverbs 3:5',
};

// Loading fallback
function ThreeLoader() {
  return (
    <Html center>
      <div className="text-center bg-white bg-opacity-75 p-4 rounded-lg shadow-md">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        <p className="mt-2 text-primary-800 text-sm font-medium">
          Loading 3D Model...
        </p>
      </div>
    </Html>
  );
}

// Improved shirt with rounded neck and better details
function RealisticShirt({ color, view, setRotating }) {
  const group = useRef();
  const materials = useRef();

  // Color palette
  const shirtColors = {
    wine: new THREE.Color("#722F37"),
    white: new THREE.Color("#FFFFFF"),
    black: new THREE.Color("#000000"),
  };

  // Setup references and create a more realistic shirt geometry
  useEffect(() => {
    if (group.current) {
      // Create materials for the shirt with the selected color
      const shirtMaterial = new THREE.MeshStandardMaterial({
        color: shirtColors[color] || shirtColors.wine,
        roughness: 0.7,
        metalness: 0.1,
      });

      // Assign to the ref for later updates
      materials.current = shirtMaterial;

      // Apply material to all shirt parts
      group.current.traverse((child) => {
        if (child.isMesh) {
          child.material = shirtMaterial;
        }
      });
    }
  }, [color]);

  // Update color when it changes
  useEffect(() => {
    if (materials.current) {
      const shirtColor = shirtColors[color] || shirtColors.wine;
      materials.current.color = shirtColor;
    }
  }, [color]);

  // Slow continuous rotation
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.005;
    }
  });

  // Get the Bible verse for the current color
  const verse = BIBLE_VERSES[color] || BIBLE_VERSES.wine;

  return (
    <group
      ref={group}
      dispose={null}
      position={[0, 0, 0]}
      rotation={[0, view === "front" ? 0 : Math.PI, 0]}
      scale={[1, 1, 1]}
    >
      {/* Shirt Body - more realistic shape */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        {/* Use a more sophisticated geometry for the shirt body */}
        <cylinderGeometry args={[1.2, 1, 2, 16, 1, true]} />
      </mesh>

      {/* Round Neck Collar */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.5, 0.1, 16, 32, Math.PI]} />
      </mesh>

      {/* Shoulders */}
      <mesh
        position={[-1.3, 0.5, 0]}
        castShadow
        receiveShadow
        rotation={[0, 0, Math.PI / 4]}
      >
        <cylinderGeometry args={[0.3, 0.4, 0.8, 16]} />
      </mesh>

      <mesh
        position={[1.3, 0.5, 0]}
        castShadow
        receiveShadow
        rotation={[0, 0, -Math.PI / 4]}
      >
        <cylinderGeometry args={[0.3, 0.4, 0.8, 16]} />
      </mesh>

      {/* Front details - only show when in front view */}
      {view === "front" && (
        <group position={[0, 0.2, 0.06]}>
          <Text
            position={[0, 0.4, 0.06]}
            fontSize={0.15}
            color={color === "white" ? "#333333" : "#FFFFFF"}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.5}
            textAlign="center"
          >
            Anglican Students
          </Text>
          <Text
            position={[0, 0.2, 0.06]}
            fontSize={0.15}
            color={color === "white" ? "#333333" : "#FFFFFF"}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.5}
            textAlign="center"
          >
            Fellowship
          </Text>
          <Text
            position={[0, -0.1, 0.06]}
            fontSize={0.1}
            color={color === "white" ? "#333333" : "#FFFFFF"}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.5}
            textAlign="center"
            italic
          >
            "Arise, Shine!"
          </Text>
        </group>
      )}

      {/* Back details with Bible verse - only show when in back view */}
      {view === "back" && (
        <group position={[0, 0.2, -0.06]}>
          <Text
            position={[0, 0.3, -0.06]}
            fontSize={0.08}
            color={color === "white" ? "#333333" : "#FFFFFF"}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
            textAlign="center"
            lineHeight={1.3}
          >
            {verse}
          </Text>
        </group>
      )}
    </group>
  );
}

// Environment for better lighting
function ShirtEnvironment() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <directionalLight position={[0, -5, 0]} intensity={0.2} />
    </>
  );
}

export default function ThreeShirt({
  onSelectColor,
  initialColor = "wine",
  enabledColors,
}) {
  const [color, setColor] = useState(initialColor || "wine");
  const [view, setView] = useState("front");
  const [rotating, setRotating] = useState(false);
  const { settings } = useSettings();

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (onSelectColor) onSelectColor(newColor);
  };

  const toggleView = () => {
    setView(view === "front" ? "back" : "front");
  };

  // Get color options from either the provided enabledColors prop or the settings
  const colorOptions = enabledColors ||
    settings?.voting?.shirtOptions?.filter((c) => c.enabled) || [
      { id: "wine", name: "Wine", hex: "#722F37" },
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "black", name: "Black", hex: "#000000" },
    ];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Select Your Favorite Color
        </h2>
        <p className="text-gray-600">
          Click on a color to see how it looks on our fellowship shirt
        </p>
      </div>

      {/* 3D Shirt Canvas */}
      <div className="w-full max-w-md h-[400px] bg-gray-50 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden">
        <Canvas
          shadows
          camera={{ position: [0, 0, 3], fov: 45 }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color("#f9fafb"));
          }}
        >
          <ShirtEnvironment />
          <RealisticShirt color={color} view={view} setRotating={setRotating} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </div>

      {/* Color Selection */}
      <div className="flex gap-4 justify-center mb-6">
        {colorOptions.map((colorOption) => (
          <motion.button
            key={colorOption.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleColorChange(colorOption.id)}
            className={`w-16 h-16 rounded-full shadow-md ${
              color === colorOption.id
                ? "ring-2 ring-offset-2 ring-primary-500"
                : ""
            }`}
            style={{
              backgroundColor: colorOption.hex,
              border: colorOption.id === "white" ? "1px solid #e5e7eb" : "none",
            }}
            aria-label={`${colorOption.name} color`}
          />
        ))}
      </div>

      {/* View toggle button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={toggleView}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow"
      >
        View {view === "front" ? "Back" : "Front"}
      </motion.button>
    </div>
  );
}
