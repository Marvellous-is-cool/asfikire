"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import VotingForm from "../../components/VotingForm";
import ThankYouCard from "../../components/ThankYouCard";
import VotingAuthForm from "../../components/VotingAuthForm";
import { canRender3D } from "../../utils/deviceDetection";
import { useSettings } from "../../contexts/SettingsContext";
import { BreadcrumbNav } from "../../components/BreadcrumbNav";
import { PageHeader } from "../../components/PageHeader";
import Link from "next/link";

// Dynamically import the 3D shirt component to avoid SSR issues
const ThreeShirt = dynamic(() => import("../../components/ThreeShirt"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 rounded-xl">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  ),
});

// Import SVG shirt component
import SVGShirt from "../../components/SVGShirt";

export default function VotePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    selectedColor: "",
    voteAmount: "",
  });
  const [onBehalfOf, setOnBehalfOf] = useState(null);
  const [voteCount, setVoteCount] = useState(0);
  const [can3D, setCan3D] = useState(false);
  const [authenticatedUsername, setAuthenticatedUsername] = useState("");
  const [authenticatedFamily, setAuthenticatedFamily] = useState("Guest"); // Add family state

  // Get settings
  const { settings, isVotingEnabled, getEnabledColors } = useSettings();
  const [votingActive, setVotingActive] = useState(false);
  const [enabledColors, setEnabledColors] = useState([]);

  // Check 3D capability and get enabled colors
  useEffect(() => {
    const can3DRender = canRender3D();
    setCan3D(can3DRender);

    // Get enabled colors from settings
    setEnabledColors(getEnabledColors());

    // Check if voting is active
    setVotingActive(isVotingEnabled());
  }, [getEnabledColors, isVotingEnabled]);

  // Handle color selection
  const handleColorSelect = (colorId) => {
    console.log(`Selected color: ${colorId}`); // Add logging for debugging
    setFormData({ ...formData, selectedColor: colorId });
    setStep(2);
  };

  // Fix authentication handling
  const handleAuthComplete = (username, family) => {
    console.log(
      "Vote page received authenticated username:",
      username,
      "family:",
      family
    );
    setAuthenticatedUsername(username);
    setAuthenticatedFamily(family || "Guest"); // Store family information
    setStep(3);
  };

  // Make sure when form is submitted that we pass the correct color
  const handleFormSubmit = async (data) => {
    try {
      setFormData({ ...formData, ...data });
      const voteCount = Math.floor(
        Number(data.voteAmount) / settings.voting.pricePerVote
      );

      // Mock payment process for demo
      setTimeout(() => {
        setVoteCount(voteCount);
        setStep(4);
      }, 1500);

      // This is where you'd normally initiate the payment process
      const paymentResponse = await initiatePayment({
        amount: Number(data.voteAmount) * 100, // Paystack uses kobo (amount * 100)
        email: `${authenticatedUsername}@anglican-fellowship.com`, // Using a placeholder email
        metadata: {
          color: formData.selectedColor, // This should now properly handle black
          voteCount: voteCount,
          onBehalfOf: onBehalfOf,
          family: authenticatedFamily, // Include family information
        },
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert(error.message || "Something went wrong. Please try again.");
    }
  };

  // Display voting closed message if voting is not active
  if (!votingActive) {
    return (
      <div className="min-h-screen pb-12">
        <PageHeader
          title="Voting Closed"
          subtitle="The voting period has ended or has not yet begun"
          imageSrc="/images/voting-header.jpg"
        />

        <div className="container mx-auto px-4 py-12">
          <BreadcrumbNav
            items={[
              { label: "Home", href: "/" },
              { label: "Vote", href: "/vote" },
            ]}
          />

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H6m6 6V5m6 0h-2m-2 0h2m-2 0V3m0 0a3 3 0 013 3v4a3 3 0 01-3 3h-3"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-playfair font-bold mb-4">
              Voting is Currently Closed
            </h2>

            {settings.voting.votingStartDate &&
            new Date(settings.voting.votingStartDate) > new Date() ? (
              <p className="text-lg text-gray-600 mb-6">
                Voting will open on{" "}
                {new Date(settings.voting.votingStartDate).toLocaleDateString()}{" "}
                at{" "}
                {new Date(settings.voting.votingStartDate).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )}
                . Please check back then!
              </p>
            ) : settings.voting.votingEndDate &&
              new Date(settings.voting.votingEndDate) < new Date() ? (
              <p className="text-lg text-gray-600 mb-6">
                Voting has ended on{" "}
                {new Date(settings.voting.votingEndDate).toLocaleDateString()}.
                Thank you to everyone who participated!
              </p>
            ) : (
              <p className="text-lg text-gray-600 mb-6">
                The voting feature is currently disabled. Please check back
                later or contact the administrator for more information.
              </p>
            )}

            <Link href="/" className="btn-primary inline-block">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <PageHeader
        title="Cast Your Vote"
        subtitle="Help us choose the perfect color for our fellowship shirts"
        imageSrc="/images/voting-header.jpg"
      />

      <div className="container mx-auto px-4 py-12">
        <BreadcrumbNav
          items={[
            { label: "Home", href: "/" },
            { label: "Vote", href: "/vote" },
          ]}
        />

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              "Select Color",
              "Authenticate",
              "Vote Details",
              "Confirmation",
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                    step > index + 1
                      ? "bg-green-500 text-white"
                      : step === index + 1
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                <span
                  className={`text-sm ${
                    step === index + 1
                      ? "text-primary-700 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-4">
            <div className="absolute top-0 h-1 bg-gray-200 w-full"></div>
            <div
              className="absolute top-0 h-1 bg-primary-600 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-5xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-3xl font-playfair font-bold text-center mb-8">
                  Choose Your Favorite Color
                </h2>

                {/* Use 3D or SVG based on capability */}
                {can3D ? (
                  <ThreeShirt
                    onSelectColor={handleColorSelect}
                    initialColor={
                      formData.selectedColor ||
                      (enabledColors.length > 0 ? enabledColors[0].id : "wine")
                    }
                    enabledColors={enabledColors}
                  />
                ) : (
                  <SVGShirt
                    onSelectColor={handleColorSelect}
                    initialColor={
                      formData.selectedColor ||
                      (enabledColors.length > 0 ? enabledColors[0].id : "wine")
                    }
                    enabledColors={enabledColors}
                  />
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <VotingAuthForm
                selectedColor={enabledColors.find(
                  (c) => c.id === formData.selectedColor
                )}
                onComplete={handleAuthComplete}
                onBack={() => setStep(1)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <VotingForm
                selectedColor={enabledColors.find(
                  (c) => c.id === formData.selectedColor
                )}
                onSubmit={handleFormSubmit}
                onBack={() => setStep(2)}
                isOnBehalf={!!onBehalfOf}
                username={authenticatedUsername}
                family={authenticatedFamily} // Pass family to form
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <ThankYouCard
                selectedColor={enabledColors.find(
                  (c) => c.id === formData.selectedColor
                )}
                isOnBehalf={!!onBehalfOf}
                voteCount={voteCount}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
