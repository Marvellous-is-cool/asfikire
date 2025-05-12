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
      className="bg-gradient-to-br from-primary-900 to-primary-800 text-white pt-16 pb-8 mt-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl font-playfair font-bold">
              Anglican Student Fellowship
            </h3>
            <div className="h-1 w-20 bg-amber-500"></div>
            <p className="text-blue-100 max-w-xs">
              A fellowship dedicated to nurturing the spiritual growth of
              Anglican students at Ikire Campus.
            </p>
            <p className="text-amber-300 italic font-medium">"Arise, Shine!"</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold">Quick Links</h3>
            <div className="h-1 w-12 bg-amber-500"></div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="inline-block hover:text-amber-300 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="inline-block hover:text-amber-300 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/vote"
                  className="inline-block hover:text-amber-300 transition-colors"
                >
                  Vote Now
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="inline-block hover:text-amber-300 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold">Contact Us</h3>
            <div className="h-1 w-12 bg-amber-500"></div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-amber-300 mt-1 mr-2 flex-shrink-0" />
                <span>
                  Osun State University, Ikire Campus, Osun State, Nigeria
                </span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-amber-300 mr-2 flex-shrink-0" />
                <a
                  href="mailto:contact@anglicansfikire.org"
                  className="hover:text-amber-300 transition-colors"
                >
                  contact@anglicansfikire.org
                </a>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-amber-300 mr-2 flex-shrink-0" />
                <a
                  href="tel:+2348012345678"
                  className="hover:text-amber-300 transition-colors"
                >
                  +234 801 234 5678
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold">Connect With Us</h3>
            <div className="h-1 w-12 bg-amber-500"></div>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <FaFacebook />
              </a>
              <a
                href="https://twitter.com"
                className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center hover:bg-blue-300 transition-colors"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center hover:bg-pink-500 transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="https://youtube.com"
                className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <FaYoutube />
              </a>
            </div>
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-2">
                Subscribe to our newsletter
              </h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 text-gray-800 rounded-l-md focus:outline-none text-sm flex-grow"
                />
                <button className="bg-amber-500 hover:bg-amber-400 transition-colors px-3 py-2 rounded-r-md text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-blue-800 mt-12 pt-8 text-center text-blue-200 text-sm">
          <p>
            Anglican Student Fellowship, Ikire Branch &copy; {currentYear} All
            Rights Reserved
          </p>
          <p className="mt-1">
            <Link
              href="/privacy-policy"
              className="hover:text-amber-300 transition-colors"
            >
              Privacy Policy
            </Link>{" "}
            |
            <Link
              href="/terms-of-service"
              className="hover:text-amber-300 transition-colors ml-2"
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
