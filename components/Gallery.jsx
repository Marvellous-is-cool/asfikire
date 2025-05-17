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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

  // Handle swipe gestures for mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeImage < galleryImages.length - 1) {
      navigateImage(1);
    } else if (isRightSwipe && activeImage > 0) {
      navigateImage(-1);
    }

    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
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
    <section id="gallery" className="py-16 md:py-24 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className="uppercase text-amber-400 font-medium tracking-wider mb-2">
            Gallery
          </h2>
          <h3 className="text-3xl md:text-4xl font-playfair font-bold mb-4 md:mb-6">
            Moments from Our Fellowship
          </h3>
          <p className="text-base md:text-lg text-gray-300">
            Glimpses of our journey together as we worship, learn, serve, and
            grow in Christ.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transform hover:scale-110 transition-transform duration-700"
                onError={() => setError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-white font-medium text-sm md:text-base">
                  {image.alt}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox - with touch support for mobile */}
      {activeImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center touch-none"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
                sizes="100vw"
                priority
                className="object-contain"
              />
            </div>

            <button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center text-xl"
              onClick={closeLightbox}
              aria-label="Close gallery"
            >
              ×
            </button>

            {activeImage > 0 && (
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(-1);
                }}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            {activeImage < galleryImages.length - 1 && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(1);
                }}
                aria-label="Next image"
              >
                ›
              </button>
            )}

            <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2 px-4 text-sm md:text-base">
              {galleryImages[activeImage].alt} ({activeImage + 1}/
              {galleryImages.length})
              <p className="text-xs mt-1 text-gray-300 block md:hidden">
                Swipe to navigate
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
