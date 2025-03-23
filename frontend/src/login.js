import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./forgotpass";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.SERVER_URL || process.env.LOCAL_HOST;
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/api/login`, {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard"); // Redirect to protected page
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-white">
      <div className="w-96 p-8 bg-white rounded-lg shadow-lg border">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Login
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin}>
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password
            </button>
          </div>

          <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200">
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don't have an account?
          <button
            className="text-blue-500 hover:underline ml-1"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </p>
      </div>
      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login;
