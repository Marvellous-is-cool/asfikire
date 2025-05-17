"use client";

import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={footerVariants}
      className="bg-gradient-to-br from-primary-900 to-primary-800 text-white pt-12 md:pt-16 pb-6 md:pb-8 mt-12 md:mt-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            variants={itemVariants}
            className="space-y-3 md:space-y-4"
          >
            <h3 className="text-lg md:text-xl font-playfair font-bold">
              Anglican Student Fellowship
            </h3>
            <div className="h-1 w-16 md:w-20 bg-amber-500"></div>
            <p className="text-blue-100 max-w-xs text-sm md:text-base">
              A fellowship dedicated to nurturing the spiritual growth of
              Anglican students at Ikire Campus.
            </p>
            <p className="text-amber-300 italic font-medium text-sm md:text-base">
              "Arise, Shine!"
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="space-y-3 md:space-y-4"
          >
            <h3 className="text-base md:text-lg font-bold">Quick Links</h3>
            <div className="h-1 w-10 md:w-12 bg-amber-500"></div>
            <ul className="space-y-1 md:space-y-2 text-sm md:text-base">
              <li>
                <Link
                  href="/"
                  className="inline-block hover:text-amber-300 transition-colors py-1"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="inline-block hover:text-amber-300 transition-colors py-1"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/vote"
                  className="inline-block hover:text-amber-300 transition-colors py-1"
                >
                  Vote Now
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="inline-block hover:text-amber-300 transition-colors py-1"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="space-y-3 md:space-y-4"
          >
            <h3 className="text-base md:text-lg font-bold">Contact Us</h3>
            <div className="h-1 w-10 md:w-12 bg-amber-500"></div>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-amber-300 mt-1 mr-2 flex-shrink-0" />
                <span className="text-blue-100">
                  Anglican Church, Campus Road, Ikire, Osun State
                </span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-amber-300 mr-2 flex-shrink-0" />
                <a
                  href="mailto:info@anglicanfellowship.org"
                  className="text-blue-100 hover:text-amber-300 transition-colors break-all"
                >
                  info@anglicanfellowship.org
                </a>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-amber-300 mr-2 flex-shrink-0" />
                <a
                  href="tel:+2348012345678"
                  className="text-blue-100 hover:text-amber-300 transition-colors"
                >
                  +234 801 234 5678
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="space-y-3 md:space-y-4"
          >
            <h3 className="text-base md:text-lg font-bold">Follow Us</h3>
            <div className="h-1 w-10 md:w-12 bg-amber-500"></div>
            <div className="flex space-x-4 text-sm md:text-base">
              <a
                href="#"
                className="bg-blue-100 bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <FaFacebook className="text-blue-100" />
              </a>
              <a
                href="#"
                className="bg-blue-100 bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <FaTwitter className="text-blue-100" />
              </a>
              <a
                href="#"
                className="bg-blue-100 bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <FaInstagram className="text-blue-100" />
              </a>
              <a
                href="#"
                className="bg-blue-100 bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all hover:scale-110"
                aria-label="YouTube"
              >
                <FaYoutube className="text-blue-100" />
              </a>
            </div>
            <p className="text-blue-100/70 text-xs md:text-sm">
              Subscribe to our social media channels for updates on our
              activities.
            </p>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-blue-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-xs md:text-sm text-center md:text-left">
              &copy; {currentYear} Anglican Student Fellowship, Ikire. All
              rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap justify-center gap-4 text-xs md:text-sm">
              <a
                className="text-blue-200 hover:text-amber-300 transition-colors"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-blue-200 hover:text-amber-300 transition-colors"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="text-blue-200 hover:text-amber-300 transition-colors"
                href="#"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
