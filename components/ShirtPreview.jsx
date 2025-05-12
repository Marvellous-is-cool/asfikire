import React, { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture,
  Text,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { motion } from "framer-motion";

// Bible verses for the back of each shirt
const BIBLE_VERSES = {
  wine: '"Let your light shine before others" - Matthew 5:16',
  white: '"Arise, shine, for your light has come" - Isaiah 60:1',
  black: '"The Lord is my shepherd" - Psalm 23:1',
};

function Shirt({ color, view, rotation }) {
  const mesh = useRef();
  const logoTexture = useTexture("/anglican-logo.png");

  // Rotate the shirt slightly for better view
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y = rotation.current;
    }
  });

  // Color hex codes
  const colors = {
    wine: "#722F37",
    white: "#FFFFFF",
    black: "#000000",
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Basic shirt mesh */}
      <mesh ref={mesh} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial
          color={colors[color]}
          roughness={0.7}
          metalness={0.1}
        />
        <boxGeometry args={[1.8, 2.5, 0.2]} />

        {/* Front logo and text - only show when viewing front */}
        {view === "front" && (
          <group position={[-0.5, 0.5, 0.11]}>
            <mesh>
              <planeGeometry args={[0.5, 0.5]} />
              <meshStandardMaterial
                map={logoTexture}
                transparent
                opacity={0.9}
              />
            </mesh>
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.08}
              color={color === "white" ? "#000000" : "#FFFFFF"}
              anchorX="left"
              anchorY="top"
              maxWidth={0.8}
              lineHeight={1.2}
            >
              Anglican{"\n"}Student Fellowship
            </Text>
          </group>
        )}

        {/* Back text - only show when viewing back */}
        {view === "back" && (
          <Text
            position={[0, 0, 0.11]}
            fontSize={0.12}
            color={color === "white" ? "#000000" : "#FFFFFF"}
            anchorX="center"
            anchorY="center"
            maxWidth={1.4}
            textAlign="center"
            lineHeight={1.4}
          >
            {BIBLE_VERSES[color]}
          </Text>
        )}
      </mesh>
    </group>
  );
}

export default function ShirtPreview({ onSelectColor }) {
  const [color, setColor] = useState("wine");
  const [view, setView] = useState("front");
  const rotation = useRef(0);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (onSelectColor) onSelectColor(newColor);
  };

  const toggleView = () => {
    if (view === "front") {
      setView("back");
      rotation.current = Math.PI;
    } else {
      setView("front");
      rotation.current = 0;
    }
  };

  return (
    <div className="w-full my-12">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">
          Shirt Preview - <span className="capitalize">{color}</span>
        </h2>

        {/* 3D Canvas */}
        <div className="w-full h-[500px] bg-gray-50 rounded-xl overflow-hidden mb-6">
          <Canvas shadows camera={{ position: [0, 0, 5], fov: 25 }}>
            <ambientLight intensity={0.5} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              intensity={1}
              castShadow
            />
            <Suspense fallback={null}>
              <Shirt color={color} view={view} rotation={rotation} />
              <Environment preset="city" />
              <ContactShadows
                position={[0, -1.5, 0]}
                opacity={0.4}
                scale={5}
                blur={2}
              />
            </Suspense>
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorChange("wine")}
              className={`px-6 py-3 rounded-lg ${
                color === "wine"
                  ? "bg-[#722F37] text-white ring-2 ring-offset-2 ring-[#722F37]"
                  : "bg-[#722F37] bg-opacity-40 text-white"
              }`}
            >
              Wine
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorChange("white")}
              className={`px-6 py-3 rounded-lg border ${
                color === "white"
                  ? "bg-white text-gray-800 ring-2 ring-offset-2 ring-gray-300"
                  : "bg-white bg-opacity-75 text-gray-800"
              }`}
            >
              White
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorChange("black")}
              className={`px-6 py-3 rounded-lg ${
                color === "black"
                  ? "bg-[#000000] text-white ring-2 ring-offset-2 ring-[#000000]"
                  : "bg-[#000000] bg-opacity-40 text-white"
              }`}
            >
              Black
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleView}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg"
          >
            View {view === "front" ? "Back" : "Front"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
