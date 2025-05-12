import { motion } from "framer-motion";
import { FaCross } from "react-icons/fa";
import { GiClothes } from "react-icons/gi";

export default function AnglicanLogo({ showMotto = true }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="bg-primary-600 rounded-full p-3">
            <FaCross className="text-white text-2xl" />
          </div>
          <div className="absolute -right-1 -bottom-1 bg-amber-500 rounded-full p-1">
            <GiClothes className="text-white text-sm" />
          </div>
        </div>
        <div className="text-xl md:text-2xl font-bold">
          <span className="text-primary-600">Anglican</span> Student Fellowship,
          Ikire Campus
        </div>
      </div>
      {showMotto && (
        <div className="text-amber-500 italic font-medium mt-1">
          "Arise, Shine!"
        </div>
      )}
    </motion.div>
  );
}
