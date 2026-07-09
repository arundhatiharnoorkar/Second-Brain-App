import { useState } from "react";
import axios from "axios";
import { useNavigate, Link} from "react-router-dom";
import toast from "react-hot-toast";
const API = import.meta.env.VITE_API_URL;



function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  

  

  const handleLogin = async () => {

     setError("");
    if (!email.trim() && !password.trim()){
      setError("Email and password are required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    

    try {
        console.log("button clicked");
      const response = await axios.post(
        `${API}/api/auth/signin`,
        {
          email,
          password,
        }
      );

      console.log(response.data);
      localStorage.setItem(
        "token",
        response.data.token
      );


      toast.success("Login successful");

      
      navigate("/dashboard");
      
    } catch (error: any) {
        
        console.log(error.message);
        toast.error("Login failed");
      }

  };


   

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back 👋</h1>
        <p className="text-gray-400 text-sm mb-6">Sign in to your notes</p>

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

        <button onClick={handleLogin}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white w-full py-2.5 font-semibold rounded-xl transition shadow-md shadow-indigo-200"
        >
          Login
        </button>

         {error && (
  <p className="text-red-500">
    {error}
  </p>
)}


<div className="mt-6 text-center">
  <p className="text-gray-500 text-sm">
    Don't have an account?{" "}
    <Link
      to="/signup"
      className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition"
    >
      Sign Up
    </Link>
  </p>
</div>

     
      </div>
    </div>
  );
}

export default Login;
