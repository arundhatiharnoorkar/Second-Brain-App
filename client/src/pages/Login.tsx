import { useState } from "react";
import axios from "axios";
import { useNavigate, Link} from "react-router-dom";
import toast from "react-hot-toast";
const API = import.meta.env.VITE_API_URL;
import { Eye, EyeOff } from "lucide-react";



function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const[showPassword,setShowPassword]=useState(false);
  const[loading,setLoading]=useState(false);
  

  

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
    setLoading(true);

    

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
        
        setError(error.message);
        toast.error("Login failed");
      }
      finally {
      setLoading(false);
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

        <button
  onClick={handleLogin}
  disabled={loading}
  className={`w-full py-3 rounded-xl font-semibold transition mt-3 ${
    loading
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-indigo-600 hover:bg-indigo-700 text-white"
  }`}
>
  {loading ? "Signing in..." : "Login"}
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
