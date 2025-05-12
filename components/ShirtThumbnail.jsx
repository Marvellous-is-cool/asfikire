import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function ShirtThumbnail({ color = "wine", size = "md" }) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Size classes for responsive design
  const sizes = {
    sm: "w-24 h-32",
    md: "w-36 h-48",
    lg: "w-48 h-64",
  };

  // Plain solid colors as requested
  const colors = {
    wine: "#722F37",
    black: "#000000",
    white: "#FFFFFF",
  };

  // 3D effect on mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isHovered || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate rotation angles (limited to -10 to 10 degrees)
      const rotateY = (x / rect.width) * 20 - 10;
      const rotateX = ((y / rect.height) * 20 - 10) * -1; // Invert Y

      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered]);

  // Reset on mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  // Get plain color
  const shirtColor = colors[color] || colors.wine;
  const sizeClass = sizes[size] || sizes.md;

  // Determine border colors for better visibility
  const isDark = color === "wine" || color === "black";
  const borderColor = color === "white" ? "#e5e7eb" : "#ffffff";
  const borderOpacity = color === "white" ? "1" : "0.15";

  // Background color for container - light for better contrast with dark shirts
  const bgColor = "#f8f8f8";

  // Plain round neck t-shirt SVG
  const getPlainRoundNeckTShirt = () => {
    return `
      <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Light backdrop for dark shirts to improve visibility -->
        ${
          isDark
            ? `<path d="M25,20 C15,30 15,35 18,40 L18,110 L82,110 L82,40 C85,35 85,30 75,20 
                L65,15 L60,10 L40,10 L35,15 Z" 
                fill="#ffffff" opacity="0.08" transform="translate(1, 1)"/>`
            : ""
        }
                
        <!-- T-shirt body - plain solid color -->
        <path d="M25,20 C15,30 15,35 18,40 L18,110 L82,110 L82,40 C85,35 85,30 75,20 
                L65,15 L60,10 L40,10 L35,15 Z" 
              fill="${shirtColor}" 
              stroke="${borderColor}"
              stroke-width="${isDark ? 0.7 : 0.4}"
              stroke-opacity="${borderOpacity}"/>
        
        <!-- Round neck collar - subtle outline -->
        <path d="M40,10 C40,12 45,25 50,25 C55,25 60,12 60,10" 
              fill="${shirtColor}" 
              stroke="${
                isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"
              }" 
              stroke-width="0.8"/>
        
        <!-- Sleeves - subtle outline -->
        <path d="M18,40 C20,45 25,47 30,45 M82,40 C80,45 75,47 70,45" 
              stroke="${
                isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"
              }" 
              stroke-width="0.8" 
              fill="none"/>
        
        <!-- Bottom hem - subtle outline -->
        <path d="M18,105 C18,112 82,112 82,105" 
              stroke="${
                isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"
              }" 
              stroke-width="1" 
              fill="none"/>
        
        <!-- Enhanced details for dark shirts -->
        ${
          isDark
            ? `
          <!-- Highlight edges for better visibility -->
          <path d="M25,20 L35,15 M75,20 L65,15" 
                stroke="rgba(255,255,255,0.3)" 
                stroke-width="0.8" 
                fill="none"/>
                
          <!-- Collar highlight -->
          <path d="M40,11 C40,13 45,24 50,24 C55,24 60,13 60,11" 
                stroke="rgba(255,255,255,0.3)" 
                stroke-width="0.5" 
                fill="none"/>
        `
            : ""
        }
        
        <!-- Minimal fabric details/folds -->
        <path d="M35,40 C45,43 55,43 65,40" 
              stroke="${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}" 
              stroke-width="0.7" 
              fill="none" 
              opacity="0.5"/>
              
        <path d="M30,60 C40,63 60,63 70,60" 
              stroke="${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}" 
              stroke-width="0.7" 
              fill="none" 
              opacity="0.5"/>
              
        <path d="M25,80 C40,83 60,83 75,80" 
              stroke="${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}" 
              stroke-width="0.7" 
              fill="none" 
              opacity="0.5"/>
      </svg>
    `;
  };

  return (
    <div className="relative">
      <motion.div
        ref={containerRef}
        className={`${sizeClass} relative overflow-hidden rounded-xl transform perspective-1000`}
        style={{
          boxShadow: `0 10px 25px rgba(0, 0, 0, 0.15), 
                     ${isDark ? "0 0 0 1px rgba(255,255,255,0.1)" : "none"}`,
          transform: `perspective(1000px) 
                     rotateX(${rotation.x}deg) 
                     rotateY(${rotation.y}deg)`,
          transformStyle: "preserve-3d",
          backgroundColor: bgColor,
          border:
            color === "white"
              ? "1px solid #e5e7eb"
              : isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "none",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-full h-full relative">
          {/* Plain round neck t-shirt SVG */}
          <div
            dangerouslySetInnerHTML={{ __html: getPlainRoundNeckTShirt() }}
          />

          {/* Enhanced visibility effect for dark shirts */}
          {isDark && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 pointer-events-none"
              animate={{
                opacity: isHovered ? 0.08 : 0.04,
              }}
              transition={{ duration: 0.6 }}
            />
          )}
        </div>
      </motion.div>

      {/* Size indicator */}
      <motion.div
        className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <span className="text-xs font-bold">{size.toUpperCase()}</span>
      </motion.div>
    </div>
  );
}
