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

  const handleSignup = async () => {
if (!email.trim() || !password.trim()) {
    setError("Email and password are required");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Invalid email address");
    return;
    
}

  if (password.length<8){
     setError("Password should contain minimum 8 characters");
     return;
  }
  if (!/[A-Z]/.test(password)){
    setError("Password should contain minimum 1 uppercase letter");
    return;

  }
  if (!/[a-z]/.test(password)){
    setError("Password should contain minimum 1 lowercase letter");
    return;

  }
  if (!/[0-9]/.test(password)){
    setError("Password should contain minimum 1 digit");
    return;

  }

  if(!/[^A-Za-z0-9]/.test(password)){
    setError("Password should contain minimum 1 special character");
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

        <button onClick={handleSignup}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white w-full py-2.5 font-semibold rounded-xl transition shadow-md shadow-indigo-200"
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
