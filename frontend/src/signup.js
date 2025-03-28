import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const { validatePassword } = require("./utils");
const { path } = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState({
    valid: false,
    message: "",
  });
  const navigate = useNavigate();
  const BASE_URL = process.env.SERVER_URL || process.env.LOCAL_HOST;

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    setPasswordFeedback(validatePassword(inputPassword));
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!passwordFeedback.valid) {
      setError(passwordFeedback.message);
      return;
    }
    try {
      await axios.post(`${BASE_URL}/v1/register`, {
        name,
        email,
        password,
      });
      // navigate("/login"); // Redirect to login after successful signup
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-white">
      <div className="w-96 p-8 bg-white rounded-lg shadow-lg border">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Sign Up
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
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
          </div>
          <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200">
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?
          <button
            className="text-blue-500 hover:underline ml-1"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
