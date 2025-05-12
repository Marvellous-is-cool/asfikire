"use client";
import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { setupAdminAccount } from "../lib/auth";
import { useSettings } from "../contexts/SettingsContext";
import { VotingStatusBanner } from "../components/VotingStatusBanner";
import { Gallery } from "../components/Gallery";
import { ContactSection } from "../components/ContactSection";
import {
  FaArrowRight,
  FaCross,
  FaPray,
  FaBookOpen,
  FaUsers,
  FaChurch,
  FaHandshake,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

// Hero component for the landing page
const Hero = () => {
  return (
    <div className="relative min-h-[90vh] flex items-center">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/80 mix-blend-multiply" />
        <Image
          src="/fellowship.jpeg"
          alt="Anglican Church"
          fill
          quality={90}
          className="object-cover"
          priority
        />
      </div>

      {/* Cross overlay - subtle */}
      <div className="absolute right-10 bottom-10 opacity-30">
        <FaCross className="text-white h-60 w-60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="text-white space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-block bg-amber-500 text-primary-900 rounded-full px-4 py-1 text-sm font-medium"
            >
              Anglican Student Fellowship, Ikire Branch
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-playfair font-bold leading-tight"
            >
              Arise, Shine, <br />
              For Your Light <br />
              Has Come
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-blue-100 max-w-lg"
            >
              Join our vibrant community of faith as we grow together in Christ.
              We're more than a fellowship; we're a family united in love and
              purpose.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/vote"
                className="btn-primary bg-amber-500 hover:bg-amber-400 text-primary-900 transition-all px-8 py-3 rounded-lg font-medium inline-flex items-center group"
              >
                Cast Your Vote
                <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/#about"
                className="btn border-2 border-white text-white hover:bg-white/10 transition-all px-8 py-3 rounded-lg font-medium"
              >
                Learn More
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-[400px] h-[500px]">
              <Image
                src="/showcase.jpeg"
                alt="Anglican Students in worship"
                fill
                className="object-cover rounded-2xl shadow-2xl"
              />

              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl">
                <div className="flex items-center space-x-2">
                  <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <FaCross className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Join Us</h3>
                    <p className="text-sm text-gray-600">Every Sunday, 8AM</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-center"
        >
          <p className="text-sm mb-2">Scroll to explore</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="h-6 w-6 border-2 border-white rounded-full mx-auto"
          >
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-1.5 w-1.5 bg-white rounded-full mx-auto mt-1.5"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// About section
const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  const features = [
    {
      icon: <FaPray className="h-6 w-6 text-primary-600" />,
      title: "Prayer Community",
      description:
        "We gather to pray, support, and encourage one another in our spiritual journeys.",
    },
    {
      icon: <FaBookOpen className="h-6 w-6 text-primary-600" />,
      title: "Bible Study",
      description:
        "Weekly study sessions to deepen our understanding of scripture and Anglican tradition.",
    },
    {
      icon: <FaUsers className="h-6 w-6 text-primary-600" />,
      title: "Fellowship",
      description:
        "Building lasting friendships grounded in shared faith and values.",
    },
    {
      icon: <FaChurch className="h-6 w-6 text-primary-600" />,
      title: "Worship",
      description:
        "Experiencing the beauty of Anglican liturgy adapted for campus life.",
    },
    {
      icon: <FaHandshake className="h-6 w-6 text-primary-600" />,
      title: "Outreach",
      description:
        "Serving our community and spreading God's love through action.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          style={{ y, opacity }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="uppercase text-primary-600 font-medium tracking-wider mb-2">
            About Us
          </h2>
          <h3 className="text-4xl font-playfair font-bold text-gray-900 mb-6">
            Anglican Student Fellowship, Ikire Branch
          </h3>
          <p className="text-lg text-gray-600">
            Founded with a mission to nurture the spiritual growth of Anglican
            students, our fellowship provides a supportive community where
            students can explore and deepen their faith while navigating campus
            life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-14 w-14 bg-primary-50 rounded-lg flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/vote"
            className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Vote for Our New Shirts <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Shirt voting preview section
const ShirtPreview = ({ enabledColors, votingActive }) => {
  const { settings } = useSettings();

  // If no colors are enabled, don't show the section
  if (enabledColors.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-br from-white to-blue-50 overflow-hidden relative">
      {/* Cross pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute transform rotate-12 -left-20 top-20">
          <FaCross className="text-primary-800 h-40 w-40" />
        </div>
        <div className="absolute transform -rotate-12 right-20 bottom-20">
          <FaCross className="text-primary-800 h-24 w-24" />
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="uppercase text-primary-600 font-medium tracking-wider mb-2">
            Shirt Voting
          </h2>
          <h3 className="text-4xl font-playfair font-bold text-gray-900 mb-6">
            Cast Your Vote for Our New Fellowship Shirts
          </h3>
          <p className="text-lg text-gray-600">
            Help us choose the perfect color for our fellowship shirts. Your
            vote matters as we create shirts that represent our community's
            spirit and identity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Only show enabled colors */}
          {enabledColors.map((color, index) => (
            <motion.div
              key={color.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="flex flex-col items-center"
            >
              <div
                className="w-64 h-80 rounded-xl shadow-xl overflow-hidden relative mb-4"
                style={{ backgroundColor: color.hex }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaCross
                    className={`h-16 w-16 ${
                      color.id === "white" ? "text-gray-300" : "text-white/30"
                    }`}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/20 p-4 text-center">
                  <h4 className="text-white font-medium capitalize text-lg">
                    {color.name}
                  </h4>
                </div>
              </div>

              <p className="text-gray-600 text-center mb-4">
                {color.id === "wine"
                  ? "Bold and dignified"
                  : color.id === "white"
                  ? "Pure and classic"
                  : "Growth and renewal"}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          {votingActive ? (
            <Link
              href="/vote"
              className="inline-flex items-center px-8 py-4 bg-amber-500 text-primary-900 rounded-lg hover:bg-amber-400 transition-colors font-bold text-lg"
            >
              Vote Now <FaArrowRight className="ml-2" />
            </Link>
          ) : (
            <div className="bg-gray-100 px-8 py-4 text-gray-700 rounded-lg inline-block">
              Voting{" "}
              {settings.voting.votingStartDate
                ? "opens soon"
                : "is currently closed"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Main landing page
export default function Home() {
  const { settings, isVotingEnabled, getEnabledColors } = useSettings();
  const [enabledColors, setEnabledColors] = useState([]);
  const [votingActive, setVotingActive] = useState(false);

  // Initialize admin account and get settings
  useEffect(() => {
    // Try to set up the admin account with clear error handling
    const initAdmin = async () => {
      try {
        console.log("Initializing admin account...");
        await setupAdminAccount();
        console.log("Admin setup complete");
      } catch (error) {
        console.error("Error setting up admin account:", error.message);
      }
    };

    initAdmin();

    // Check if voting is enabled and get enabled colors
    setVotingActive(isVotingEnabled());
    setEnabledColors(getEnabledColors());
  }, [isVotingEnabled, getEnabledColors]);

  return (
    <div className="min-h-screen">
      <VotingStatusBanner />
      <Hero />
      <About />
      <ShirtPreview enabledColors={enabledColors} votingActive={votingActive} />
      <Gallery />
      <ContactSection />
    </div>
  );
}
