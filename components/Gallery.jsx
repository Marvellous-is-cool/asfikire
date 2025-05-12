"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSettings } from "../contexts/SettingsContext";
import { FaImage, FaExclamationCircle } from "react-icons/fa";

export function Gallery() {
  const { settings } = useSettings();
  const [activeImage, setActiveImage] = useState(null);
  const [error, setError] = useState(false);

  // Get enabled gallery images
  const galleryImages = settings.gallery.enabled
    ? settings.gallery.images.filter((img) => img.enabled)
    : [];

  // Function to handle image click for lightbox
  const openLightbox = (index) => {
    setActiveImage(index);
    document.body.style.overflow = "hidden"; // Prevent scrolling when lightbox is open
  };

  // Function to close lightbox
  const closeLightbox = () => {
    setActiveImage(null);
    document.body.style.overflow = "auto"; // Restore scrolling
  };

  // Navigate through images in lightbox
  const navigateImage = (direction) => {
    if (activeImage === null) return;

    const newIndex = activeImage + direction;
    if (newIndex >= 0 && newIndex < galleryImages.length) {
      setActiveImage(newIndex);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeImage === null) return;

      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateImage(1);
      if (e.key === "ArrowLeft") navigateImage(-1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImage, galleryImages.length]);

  if (!settings.gallery.enabled) {
    return null; // Don't render if gallery is disabled
  }

  if (galleryImages.length === 0) {
    return (
      <div className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <FaImage className="mx-auto text-gray-400 text-5xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Gallery</h2>
            <p className="text-gray-500">
              No gallery images available at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="gallery" className="py-24 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="uppercase text-amber-400 font-medium tracking-wider mb-2">
            Gallery
          </h2>
          <h3 className="text-4xl font-playfair font-bold mb-6">
            Moments from Our Fellowship
          </h3>
          <p className="text-lg text-gray-300">
            Glimpses of our journey together as we worship, learn, serve, and
            grow in Christ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transform hover:scale-110 transition-transform duration-700"
                onError={() => setError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-white font-medium">{image.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {activeImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full w-full">
              <Image
                src={galleryImages[activeImage].src}
                alt={galleryImages[activeImage].alt}
                fill
                className="object-contain"
              />
            </div>

            <button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
              onClick={closeLightbox}
            >
              ×
            </button>

            {activeImage > 0 && (
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(-1);
                }}
              >
                ‹
              </button>
            )}

            {activeImage < galleryImages.length - 1 && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(1);
                }}
              >
                ›
              </button>
            )}

            <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2">
              {galleryImages[activeImage].alt} ({activeImage + 1}/
              {galleryImages.length})
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
