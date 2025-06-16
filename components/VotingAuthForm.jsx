import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaUserFriends,
  FaCheck,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import ShirtThumbnail from "./ShirtThumbnail";
import {
  checkUsernameExists,
  registerMember,
  signInMember,
  autoAuthenticateMember,
  FAMILIES,
  createGuestMember,
} from "../lib/auth";

const formVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
    },
  },
};

const LoginForm = ({
  username,
  setUsername,
  onLogin,
  onBack,
  onRegister,
  isCheckingUsername,
  usernameError,
  selectedColor,
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await onLogin(username, password);
    } catch (err) {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <motion.div
      key="login"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Back
        </button>
      </div>

      <div className="mb-4 flex justify-center">
        <ShirtThumbnail color={selectedColor.id} size="large" />
      </div>

      <div className="bg-primary-50 rounded-lg p-4 mb-6 flex items-center">
        <FaUser className="text-primary-500 mr-3" />
        <div>
          <p className="font-medium text-primary-800">{username}</p>
          <p className="text-sm text-primary-600">
            Enter your password to continue
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Enter your password"
            required
            autoFocus
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => onRegister()}
            className="flex-1 py-3 px-4 text-center rounded-xl border border-primary-200 text-primary-700 font-medium hover:bg-primary-50 transition-colors"
          >
            Register Instead
          </button>
          <button type="submit" className="flex-1 btn-primary">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const UsernameForm = ({
  username,
  setUsername,
  onContinue,
  onBack,
  isCheckingUsername,
  usernameError,
  selectedColor,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim()) {
      onContinue(username);
    }
  };

  return (
    <motion.div
      key="username"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Member Login</h2>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Back
        </button>
      </div>

      <div className="mb-4 flex justify-center">
        <ShirtThumbnail color={selectedColor.id} size="large" />
      </div>

      <p className="text-gray-600 mb-6">
        Enter your username to continue with your vote.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`input-field pr-10 ${
                usernameError ? "border-red-500 ring-red-100" : ""
              }`}
              placeholder="Enter your username"
              required
              autoFocus
            />
            {isCheckingUsername && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-primary-500 rounded-full border-t-transparent"></div>
              </div>
            )}
            {!isCheckingUsername && username && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {usernameError ? (
                  <FaTimes className="text-red-500" />
                ) : (
                  <FaCheck className="text-green-500" />
                )}
              </div>
            )}
          </div>
          {usernameError && (
            <p className="mt-1 text-sm text-red-600">{usernameError}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full btn-primary"
          disabled={isCheckingUsername}
        >
          Continue
        </button>
      </form>
    </motion.div>
  );
};

const RegisterForm = ({
  username,
  onRegister,
  onBack,
  onLoginInstead,
  selectedColor,
}) => {
  const [family, setFamily] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!family) {
      setError("Please select your family");
      return;
    }

    setIsRegistering(true);
    try {
      await onRegister(username, family, password);
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <motion.div
      key="register"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create an Account</h2>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Back
        </button>
      </div>

      <div className="mb-4 flex justify-center">
        <ShirtThumbnail color={selectedColor.id} size="large" />
      </div>

      <div className="bg-primary-50 rounded-lg p-4 mb-6 flex items-center">
        <FaUser className="text-primary-500 mr-3" />
        <div>
          <p className="font-medium text-primary-800">{username}</p>
          <p className="text-sm text-primary-600">Complete your registration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Your Family
          </label>
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className="input-field"
            required
          >
            <option value="">-- Select Family --</option>
            {FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Create a password"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 6 characters
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder="Confirm your password"
            required
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-600">
            This is a one-time registration. For future voting, you'll only need
            to enter your username.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onLoginInstead}
            className="flex-1 py-3 px-4 text-center rounded-xl border border-primary-200 text-primary-700 font-medium hover:bg-primary-50 transition-colors"
          >
            Login Instead
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary"
            disabled={isRegistering}
          >
            {isRegistering ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const VotingTypeButtons = ({ onVotingTypeSelected, onBack, selectedColor }) => {
  return (
    <motion.div
      key="votingType"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-2xl p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onVotingTypeSelected("self")}
          className="bg-primary-50 hover:bg-primary-100 rounded-xl p-6 text-left transition-all duration-300"
        >
          <div className="flex items-center mb-3">
            <div className="bg-primary-100 p-3 rounded-full">
              <FaUser className="h-6 w-6 text-primary-700" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            I'm voting for myself
          </h3>
          <p className="text-sm text-gray-600">
            Vote as a member of the fellowship
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onVotingTypeSelected("behalf")}
          className="bg-blue-50 hover:bg-blue-100 rounded-xl p-6 text-left transition-all duration-300"
        >
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUserFriends className="h-6 w-6 text-blue-700" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            I'm voting on behalf of someone
          </h3>
          <p className="text-sm text-gray-600">
            Vote for a member of the fellowship
          </p>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function VotingAuthForm({ selectedColor, onComplete, onBack }) {
  const [step, setStep] = useState("type"); // type, username, login, register
  const [votingType, setVotingType] = useState(null);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authMode, setAuthMode] = useState("guest"); // guest, existing

  const handleVotingTypeSelected = (type) => {
    setVotingType(type);
    setStep("username");
  };

  const handleAuthComplete = (username) => {
    // Make sure we're passing a valid username
    if (!username || username.trim() === "") {
      console.error("Invalid username in handleAuthComplete:", username);
      setUsernameError(
        "Username cannot be empty. Please enter a valid username."
      );
      return;
    }

    console.log("Authentication complete, username:", username);

    // Call the parent's onComplete with the username
    onComplete(username);
  };

  const handleCheckUsername = async (username) => {
    if (!username.trim()) {
      setUsernameError("Username is required");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError("");

    try {
      console.log(`Checking username: ${username}`);
      const exists = await checkUsernameExists(username);
      console.log(`Username "${username}" exists: ${exists}`);

      if (exists) {
        // Username exists - directly authenticate without password
        console.log(
          `Username "${username}" exists, proceeding with direct auth`
        );
        // Skip login form and password check - call handleAuthComplete directly
        handleAuthComplete(username);
      } else {
        // Username doesn't exist
        if (votingType === "self") {
          // If voting for self, we can register
          console.log(
            `Username doesn't exist, showing registration for: ${username}`
          );
          setStep("register");
        } else {
          // If voting on behalf, display error
          setUsernameError(
            "This username doesn't exist. Please try another or register them."
          );
        }
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameError(
        `Error checking username: ${error.message}. Please try again.`
      );
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      console.log(`Attempting to login user: ${username}`);
      await signInMember(username, password);
      console.log(`Successfully logged in: ${username}`);
      handleAuthComplete(username);
    } catch (error) {
      console.error(`Login error for ${username}:`, error);
      throw error;
    }
  };

  const handleRegister = async (username, family, password) => {
    try {
      console.log(`Registering user: ${username}, Family: ${family}`);

      // Register the member
      await registerMember(username, family, password);

      // Auto-login after registration
      console.log(`Registration successful, signing in: ${username}`);
      await signInMember(username, password);

      // Show success message and complete auth
      setSuccessMessage(`Registration successful! Welcome, ${username}!`);

      // Call handleAuthComplete after successful registration
      handleAuthComplete(username);
    } catch (error) {
      console.error(`Registration error for ${username}:`, error);
      throw error;
    }
  };

  const handleGuestRegister = async (username, family) => {
    try {
      console.log(`Creating guest member: ${username}, Family: ${family}`);

      // Create a guest member - simpler process without auth
      const newUser = await createGuestMember(username, family);

      console.log("Created guest member successfully:", newUser);
      setSuccessMessage(`Welcome, ${username}!`);

      // Complete auth with new username
      setTimeout(() => {
        handleAuthComplete(username);
      }, 1000);
    } catch (error) {
      console.error(`Guest registration error for ${username}:`, error);
      throw error;
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a guest member with the provided family
      const guestUser = await createGuestMember(username, family);

      // Save the auth data in a cookie or localStorage
      localStorage.setItem(
        "anglican_auth",
        JSON.stringify({
          username: guestUser.username,
          uid: guestUser.uid,
          family: guestUser.family, // Make sure family is stored
          isGuest: true,
        })
      );

      onComplete(guestUser.username, guestUser.family); // Pass both username and family
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExistingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in the member
      const userData = await signInMember(username, password);

      // Save the auth data
      localStorage.setItem(
        "anglican_auth",
        JSON.stringify({
          username: userData.username,
          uid: userData.uid,
          family: userData.family, // Make sure family is stored
          isGuest: false,
        })
      );

      onComplete(userData.username, userData.family); // Pass both username and family
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log(
        `VotingAuthForm: Attempting auto-auth for username: "${username}"`
      );

      // Auto-authenticate by username
      const userData = await autoAuthenticateMember(username);

      console.log(`VotingAuthForm: Auto-auth returned data:`, userData);
      console.log(
        `VotingAuthForm: Input username was: "${username}", returned username: "${userData.username}"`
      );

      // IMPORTANT: Always use the original input username for consistency
      // This is the key fix to prevent the username switching issue
      const usernameToUse = username.toLowerCase(); // Original input username

      // Save the auth data with the original input username
      localStorage.setItem(
        "anglican_auth",
        JSON.stringify({
          username: usernameToUse, // Use input username instead of returned one
          uid: userData.uid,
          family: userData.family, // Make sure family is stored
          isTemporary: true,
        })
      );

      console.log(
        `VotingAuthForm: Calling onComplete with username: "${usernameToUse}", family: "${userData.family}"`
      );
      onComplete(usernameToUse, userData.family); // Use input username instead of returned one
    } catch (error) {
      console.log(
        `VotingAuthForm: Auto-auth failed for "${username}":`,
        error.message
      );
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Authenticate to Vote</h2>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>
      </div>

      {/* Add shirt thumbnail display */}
      <div className="mb-6 flex flex-col items-center justify-center">
        <div className="mb-3">
          <ShirtThumbnail color={selectedColor?.id || "wine"} size="lg" />
        </div>
        <p className="text-center text-lg">
          You selected{" "}
          <span className="font-bold capitalize">
            {selectedColor?.name || "Wine"}
          </span>
        </p>
      </div>

      {/* Success message if displayed */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "type" && (
          <VotingTypeButtons
            onVotingTypeSelected={handleVotingTypeSelected}
            onBack={onBack}
            selectedColor={selectedColor}
          />
        )}

        {step === "username" && (
          <UsernameForm
            username={username}
            setUsername={setUsername}
            onContinue={handleCheckUsername}
            onBack={() => setStep("type")}
            isCheckingUsername={isCheckingUsername}
            usernameError={usernameError}
            selectedColor={selectedColor}
          />
        )}

        {/* Login form is no longer needed but keep it in case we need to revert */}
        {step === "login" && (
          <LoginForm
            username={username}
            setUsername={setUsername}
            onLogin={handleLogin}
            onBack={() => setStep("username")}
            onRegister={() => setStep("register")}
            selectedColor={selectedColor}
          />
        )}

        {step === "register" && (
          <RegisterForm
            username={username}
            onRegister={handleRegister}
            onBack={() => setStep("username")}
            onLoginInstead={() => setStep("login")}
            selectedColor={selectedColor}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
