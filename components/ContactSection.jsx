"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSettings } from "../contexts/SettingsContext";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMapPin,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";

export function ContactSection() {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate form data
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all fields");
      setSubmitting(false);
      return;
    }

    try {
      // Here you would normally send the data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const { address, email, phone, programSchedule, socialLinks } =
    settings.contact;

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="uppercase text-primary-600 font-medium tracking-wider mb-2">
            Contact Us
          </h2>
          <h3 className="text-4xl font-playfair font-bold text-gray-900 mb-6">
            Get in Touch
          </h3>
          <p className="text-lg text-gray-600">
            Have questions about our fellowship or need more information? Reach
            out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 p-8 rounded-xl"
          >
            <h4 className="text-2xl font-bold text-gray-900 mb-6">
              Send Us a Message
            </h4>

            {submitted ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-2">
                    <FaPaperPlane className="text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h5 className="font-medium text-green-800">
                      Message Sent!
                    </h5>
                    <p className="text-green-700 text-sm">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-between"
          >
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">
                Our Weekly Programmes
              </h4>

              {programSchedule.map((program, index) => (
                <div
                  key={index}
                  className="bg-primary-50 border-l-4 border-primary-600 p-6 rounded-r-lg mb-4"
                >
                  <h5 className="font-bold text-gray-900 mb-1 flex items-center">
                    <FaCalendarAlt className="text-primary-600 mr-2" />
                    {program.name}
                  </h5>
                  <p className="text-gray-600 mb-1 flex items-center ml-6">
                    <FaClock className="text-primary-500 mr-2" />
                    {program.time}
                  </p>
                  <p className="text-gray-600 flex items-center ml-6">
                    <FaMapPin className="text-primary-500 mr-2" />
                    {program.location}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">
                Reach Us
              </h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                  <p className="text-gray-600">{address}</p>
                </div>

                <div className="flex items-center">
                  <FaEnvelope className="text-primary-600 mr-3 h-5 w-5 flex-shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {email}
                  </a>
                </div>

                <div className="flex items-center">
                  <FaPhone className="text-primary-600 mr-3 h-5 w-5 flex-shrink-0" />
                  <a
                    href={`tel:${phone}`}
                    className="text-primary-600 hover:underline"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
