"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ShirtDesigner from "../utils/ShirtDesigner";
import { useSettings } from "../contexts/SettingsContext";
import React from "react";

export default function SVGShirt({
  onSelectColor,
  initialColor,
  enabledColors,
}) {
  const [color, setColor] = useState(initialColor || "wine");
  const [view, setView] = useState("front");
  const [rotating, setRotating] = useState(false);
  const { settings } = useSettings();

  // If enabledColors isn't provided, get them from settings
  const availableColors =
    enabledColors || settings.voting.shirtOptions.filter((c) => c.enabled);

  // Create a shirt designer
  const shirtDesigner = new ShirtDesigner();

  // Update SVG when color or view changes
  useEffect(() => {
    const svg = shirtDesigner.exportSVG(color, view);
    setSvgContent(svg);
  }, [color, view]);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (onSelectColor) onSelectColor(newColor);
  };

  const toggleView = () => {
    if (rotating) return;

    setRotating(true);
    setTimeout(() => {
      setView(view === "front" ? "back" : "front");
      setRotating(false);
    }, 500);
  };

  // Map color names to hex values
  const colorMap = {
    wine: "#722F37",
    white: "#FFFFFF",
    black: "#000000", // Changed from green to black
  };

  // Get hex value from color name or use the provided color
  const fillColor = colorMap[color] || color;

  return (
    <div className="w-full my-8">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">
          Shirt Preview - <span className="capitalize">{color}</span>
        </h2>

        {/* Display SVG content */}
        <motion.div
          className="w-full max-w-md mb-8 relative"
          style={{ height: "600px" }}
          animate={{
            rotateY: rotating ? (view === "front" ? 90 : -90) : 0,
            opacity: rotating ? 0.5 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          <div className="flex justify-center gap-4">
            {availableColors.map((colorOption) => (
              <motion.button
                key={colorOption.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorChange(colorOption.id)}
                className="px-6 py-3 rounded-lg"
                style={{
                  backgroundColor:
                    color === colorOption.id
                      ? colorOption.hex
                      : `${colorOption.hex}66`,
                  color: colorOption.id === "white" ? "#1f2937" : "white",
                  border:
                    colorOption.id === "white" ? "1px solid #e5e7eb" : "none",
                  boxShadow:
                    color === colorOption.id
                      ? "0 0 0 2px white, 0 0 0 4px " + colorOption.hex
                      : "none",
                }}
              >
                {colorOption.name}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleView}
            disabled={rotating}
            className={`px-6 py-3 bg-primary-600 text-white rounded-lg ${
              rotating ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            View {view === "front" ? "Back" : "Front"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
