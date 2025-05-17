import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function ShirtThumbnail({ color = "wine", size = "md" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });

  // Size classes for responsive design
  const sizes = {
    sm: "w-20 h-28 md:w-24 md:h-32",
    md: "w-32 h-40 md:w-36 md:h-48",
    lg: "w-40 h-52 md:w-48 md:h-64",
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

  // Handle touch events for mobile devices
  const handleTouchStart = (e) => {
    setIsTouching(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      setTouchPosition({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isTouching || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Calculate rotation angles (limited to -7 to 7 degrees for mobile - less extreme)
    const rotateY = (x / rect.width) * 14 - 7;
    const rotateX = ((y / rect.height) * 14 - 7) * -1; // Invert Y

    setRotation({ x: rotateX, y: rotateY });
    setTouchPosition({ x, y });
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    // Gradually reset rotation
    setTimeout(() => {
      setRotation({ x: 0, y: 0 });
    }, 300);
  };

  // Reset on mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  // Get plain color
  const shirtColor = colors[color] || colors.wine;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${sizeClass} cursor-pointer overflow-hidden rounded-md`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Main shirt body */}
      <div
        className="absolute inset-0 rounded-md"
        style={{
          backgroundColor: shirtColor,
          boxShadow:
            isHovered || isTouching
              ? "0 10px 25px -5px rgba(0,0,0,0.3)"
              : "0 4px 10px -2px rgba(0,0,0,0.1)",
        }}
      >
        {/* Collar */}
        <div
          className="absolute top-[15%] left-1/2 w-[20%] h-[10%] transform -translate-x-1/2 rounded-b-full"
          style={{
            backgroundColor: "rgba(0,0,0,0.1)",
          }}
        ></div>

        {/* ASF logo, subtle for thumbnails */}
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] flex items-center justify-center opacity-60">
          <div
            className="text-white text-center font-bold"
            style={{
              fontSize: size === "sm" ? "8px" : size === "md" ? "12px" : "14px",
            }}
          >
            ASF
          </div>
        </div>
      </div>

      {/* Highlight effect - responds to touch or hover */}
      {(isHovered || isTouching) && (
        <div
          className="absolute inset-0 bg-white opacity-10 rounded-md pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${touchPosition.x || 50}px ${
              touchPosition.y || 20
            }px, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)`,
          }}
        ></div>
      )}
    </motion.div>
  );
}
