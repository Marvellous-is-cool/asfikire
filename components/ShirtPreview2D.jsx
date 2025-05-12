import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCross } from "react-icons/fa";

const BIBLE_VERSES = {
  wine: '"Let your light shine before others" - Matthew 5:16',
  white: '"Arise, shine, for your light has come" - Isaiah 60:1',
  black: '"The Lord is my shepherd" - Psalm 23:1',
};

export default function ShirtPreview2D({ onSelectColor, initialColor }) {
  const [color, setColor] = useState(initialColor || "wine");
  const [view, setView] = useState("front");
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (onSelectColor) onSelectColor(newColor);
  };

  const toggleView = () => {
    setIsAnimating(true);
    if (view === "front") {
      animateRotation(0, 180);
      setTimeout(() => {
        setView("back");
        setIsAnimating(false);
      }, 500);
    } else {
      animateRotation(180, 360);
      setTimeout(() => {
        setView("front");
        setRotation(0);
        setIsAnimating(false);
      }, 500);
    }
  };

  const animateRotation = (start, end) => {
    let startTime;
    const duration = 500; // ms

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smoother animation
      const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
      const currentValue = start + (end - start) * easeInOut(progress);

      setRotation(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Dynamic styles based on color
  const shirtStyles = {
    wine: {
      bg: "bg-[#722F37]",
      text: "text-white",
      shadow: "shadow-[#722F37]/30",
    },
    white: {
      bg: "bg-white border border-gray-300",
      text: "text-gray-800",
      shadow: "shadow-gray-400/30",
    },
    black: {
      bg: "bg-[#000000]",
      text: "text-white",
      shadow: "shadow-[#000000]/30",
    },
  };

  // Calculate perspective transform based on rotation
  const getTransform = () => {
    const transformValue = `perspective(1200px) rotateY(${rotation}deg)`;
    const opacityValue = rotation > 90 && rotation < 270 ? 0 : 1;

    return {
      transform: transformValue,
      opacity: opacityValue,
    };
  };

  return (
    <div className="w-full my-8">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">
          Shirt Preview - <span className="capitalize">{color}</span>
        </h2>

        <div className="relative w-full max-w-md h-[400px] mb-8 flex justify-center items-center">
          {/* Front side */}
          <motion.div
            className={`absolute inset-0 ${shirtStyles[color].bg} rounded-lg ${shirtStyles[color].shadow} shadow-2xl backface-hidden`}
            style={{
              ...getTransform(),
              backfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
              display: rotation > 90 && rotation < 270 ? "none" : "block",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Shirt collar */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-transparent border-t-0 border-l-[20px] border-r-[20px] border-b-[10px] border-transparent border-b-white/10"></div>

            {/* Shirt sleeves */}
            <div className="absolute top-[60px] left-0 w-1/4 h-20 bg-transparent border-l-0 border-t-[20px] border-b-[20px] border-r-[10px] border-transparent border-r-white/10"></div>
            <div className="absolute top-[60px] right-0 w-1/4 h-20 bg-transparent border-r-0 border-t-[20px] border-b-[20px] border-l-[10px] border-transparent border-l-white/10"></div>

            {/* Logo and text */}
            <div className="absolute top-5 left-5 w-28 p-2">
              <div className="flex flex-col items-start">
                <div className="relative mb-2 flex items-center justify-center">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <FaCross
                      className={`text-2xl ${shirtStyles[color].text}`}
                    />
                  </div>
                </div>
                <h3
                  className={`text-sm font-semibold ${shirtStyles[color].text}`}
                >
                  Anglican
                </h3>
                <h3
                  className={`text-sm font-semibold ${shirtStyles[color].text}`}
                >
                  Student Fellowship
                </h3>
                <div
                  className={`text-xs italic mt-1 ${shirtStyles[color].text}`}
                >
                  "Arise, Shine!"
                </div>
              </div>
            </div>

            {/* Shirt fold lines - for realism */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/5"></div>
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/5"></div>
          </motion.div>

          {/* Back side */}
          <motion.div
            className={`absolute inset-0 ${shirtStyles[color].bg} rounded-lg ${shirtStyles[color].shadow} shadow-2xl backface-hidden`}
            style={{
              ...getTransform(),
              backfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
              rotateY: "180deg",
              display: rotation > 90 && rotation < 270 ? "block" : "none",
            }}
          >
            {/* Shirt collar */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-transparent border-t-0 border-l-[20px] border-r-[20px] border-b-[10px] border-transparent border-b-white/10"></div>

            {/* Shirt sleeves */}
            <div className="absolute top-[60px] left-0 w-1/4 h-20 bg-transparent border-l-0 border-t-[20px] border-b-[20px] border-r-[10px] border-transparent border-r-white/10"></div>
            <div className="absolute top-[60px] right-0 w-1/4 h-20 bg-transparent border-r-0 border-t-[20px] border-b-[20px] border-l-[10px] border-transparent border-l-white/10"></div>

            {/* Bible verse */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className={`text-center ${shirtStyles[color].text} text-lg`}>
                {BIBLE_VERSES[color]}
              </p>
            </div>

            {/* Shirt fold lines - for realism */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/5"></div>
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/5"></div>
          </motion.div>
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
            disabled={isAnimating}
            className={`px-6 py-3 bg-primary-600 text-white rounded-lg ${
              isAnimating ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            View {view === "front" ? "Back" : "Front"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
