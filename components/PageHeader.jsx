import Image from "next/image";
import { motion } from "framer-motion";

export function PageHeader({ title, subtitle, imageSrc }) {
  return (
    <div className="relative h-60 sm:h-70 md:h-80 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc || "/images/fellowship.jpeg"}
          alt="Header background"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary-900/70" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full relative z-10">
        <div className="flex flex-col justify-center h-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-2 md:mb-4"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl line-clamp-3 md:line-clamp-none"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
