import { useState } from "react";
import axios from "axios";
const { validatePassword } = require("./utils");
const { path } = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState({
    valid: false,
    message: "",
  });
  const BASE_URL = process.env.SERVER_URL || process.env.LOCAL_HOST;

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setNewPassword(inputPassword);
    setPasswordFeedback(validatePassword(inputPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setMessage("");
      return;
    }

    if (!passwordFeedback.valid) {
      setError(passwordFeedback.message);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/v1/reset-password`, {
        email,
        newPassword,
      });
      setMessage(response.data.message);
      setError("");
    } catch (err) {
      setError("Error resetting password. Please try again.");
      setMessage("");
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-96 z-50">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
        Reset Password
      </h2>
      {message && <p className="text-green-500 text-center">{message}</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block text-gray-700 font-medium">
          Enter your email
        </label>
        <input
          type="email"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="block text-gray-700 font-medium mt-4">
          New Password
        </label>
        <input
          type="password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
          value={newPassword}
          onChange={handlePasswordChange}
          required
        />
        {/* 🔹 Show password validation feedback */}
        {passwordFeedback.message && (
          <p
            className={`text-sm mt-1 ${
              passwordFeedback.valid ? "text-green-500" : "text-red-500"
            }`}
          >
            {passwordFeedback.message}
          </p>
        )}

        <label className="block text-gray-700 font-medium mt-4">
          Confirm Password
        </label>
        <input
          type="password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 mt-4"
        >
          Reset Password
        </button>
      </form>
      <button
        onClick={onClose}
        className="w-full bg-gray-400 text-white p-2 rounded hover:bg-gray-500 transition duration-200 mt-4"
      >
        Close
      </button>
    </div>
  );
};
export default ForgotPassword;
