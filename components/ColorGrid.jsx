import { motion } from "framer-motion";

export default function ColorGrid({ colors, onColorSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {colors.map((color, index) => (
        <motion.div
          key={color.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className="color-card cursor-pointer"
          style={{ backgroundColor: color.hex }}
          onClick={() => onColorSelect(color.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="color-card-content">
            <h3 className="text-2xl font-bold">{color.name}</h3>
            <p className="text-white/80 mt-1">Click to select</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
