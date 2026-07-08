import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";


const API = import.meta.env.VITE_API_URL;

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special;

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid =
    isEmailValid && isPasswordValid;

  const handleSignup = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/api/auth/signup`, {
        email,
        password,
      });

      toast.success("Signup successful");
      navigate("/signin");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.join(", ") ||
        "Signup failed";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Create an account 🧠
        </h1>

        <p className="text-gray-400 text-sm mb-6">
          Start capturing your ideas
        </p>

        

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className="bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl p-3 w-full mb-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
        />

        {email.length > 0 && !isEmailValid && (
          <p className="text-red-500 text-sm mb-3">
            Please enter a valid email address.
          </p>
        )}

        

        <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => {
      setPassword(e.target.value);
      setError("");
    }}
    className="bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl p-3 w-full pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

       

        {password.length > 0 && (
          <div className="text-sm mt-3 space-y-1 mb-5">

            <p className={passwordChecks.length ? "text-green-600" : "text-gray-500"}>
              {passwordChecks.length ? "✅" : "⭕"} At least 8 characters
            </p>

            <p className={passwordChecks.uppercase ? "text-green-600" : "text-gray-500"}>
              {passwordChecks.uppercase ? "✅" : "⭕"} One uppercase letter
            </p>

            <p className={passwordChecks.lowercase ? "text-green-600" : "text-gray-500"}>
              {passwordChecks.lowercase ? "✅" : "⭕"} One lowercase letter
            </p>

            <p className={passwordChecks.number ? "text-green-600" : "text-gray-500"}>
              {passwordChecks.number ? "✅" : "⭕"} One number
            </p>

            <p className={passwordChecks.special ? "text-green-600" : "text-gray-500"}>
              {passwordChecks.special ? "✅" : "⭕"} One special character
            </p>

          </div>
        )}

        

        <button
          onClick={handleSignup}
          disabled={!isFormValid || loading}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            isFormValid
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

       

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">
            {error}
          </p>
        )}

        

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
}

export default Signup;