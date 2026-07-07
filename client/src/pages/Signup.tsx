import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const API = import.meta.env.VITE_API_URL;

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

  const handleSignup = async () => {

    if (!email.trim()){
      setError("Email is required");
      return;
    }

    if (!password.trim()){
      setError("password is required");
      return;
    }


    try {
        console.log("button clicked");
      const response = await axios.post(
        `${API}/api/auth/signup`,
        {
          email,
          password,
        }
      );

      console.log(response.data);

      toast.success("Signup successful");
      navigate("/signin");
    } catch (error: any) {
        
        console.log(error.message);
        toast.error("Signup failed");
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-gray-900 mb-1">Create an account 🧠</h1>
        <p className="text-gray-400 text-sm mb-6">Start capturing your ideas</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl p-3 w-full mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl p-3 w-full mb-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
        />

        <div className="text-sm mt-2 space-y-1">
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

       <button
  onClick={handleSignup}
  disabled={!isPasswordValid}
  className={`w-full py-2.5 rounded-xl font-semibold transition ${
    isPasswordValid
      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  Signup
</button>

        {error && (
  <p className="text-red-500">
    {error}
  </p>
)}

      </div>
    </div>
  );
}

export default Signup;
