import { useState } from "react";
import axios from "axios";

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setMessage("");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/reset-password",
        {
          email,
          newPassword,
        }
      );
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
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
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
