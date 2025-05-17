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
  const [svgContent, setSvgContent] = useState("");
  const { settings } = useSettings();

  // If enabledColors isn't provided, get them from settings
  const availableColors =
    enabledColors ||
    (settings?.voting?.shirtOptions
      ? settings.voting.shirtOptions.filter((c) => c.enabled)
      : [
          { id: "wine", name: "Wine", hex: "#722F37" },
          { id: "white", name: "White", hex: "#FFFFFF" },
          { id: "black", name: "Black", hex: "#000000" },
        ]);

  // Create a shirt designer
  const shirtDesigner = new ShirtDesigner();

  // Update SVG when color or view changes
  useEffect(() => {
    try {
      const svg = shirtDesigner.exportSVG(color, view);
      setSvgContent(svg);
    } catch (err) {
      console.error("Error generating SVG:", err);
      // Set a basic fallback content if SVG generation fails
      setSvgContent(`<svg width="500" height="600" viewBox="0 0 500 600">
        <rect width="100%" height="100%" fill="${
          colorMap[color] || "#722F37"
        }" />
        <text x="50%" y="50%" fill="white" text-anchor="middle">Shirt Preview</text>
      </svg>`);
    }
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
    <div className="w-full my-4 sm:my-8">
      <div className="flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
          Shirt Preview - <span className="capitalize">{color}</span>
        </h2>

        {/* Display SVG content - Responsive container for mobile */}
        <motion.div
          className="w-full max-w-md mb-4 sm:mb-8 relative"
          style={{ height: "min(70vh, 600px)" /* Responsive height */ }}
          animate={{
            rotateY: rotating ? (view === "front" ? 90 : -90) : 0,
            opacity: rotating ? 0.5 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </motion.div>

        {/* Controls - Mobile-friendly adjustments */}
        <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-md">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {availableColors.map((colorOption) => (
              <motion.button
                key={colorOption.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorChange(colorOption.id)}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
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
                  touchAction: "manipulation", // Better touch handling for mobile
                }}
                aria-label={`Select ${colorOption.name} color`}
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
            className={`px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg text-sm sm:text-base ${
              rotating ? "opacity-70 cursor-not-allowed" : ""
            }`}
            aria-label={`View ${view === "front" ? "back" : "front"} of shirt`}
          >
            View {view === "front" ? "Back" : "Front"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
