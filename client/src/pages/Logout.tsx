import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
       
      localStorage.removeItem(
        "token",
      
      );
      


      alert("Logout successful");

      
      navigate("/signin");
      
    } catch (error: any) {
        
        console.log(error.message);
        alert("LogOut failed");
      }

  };
  

  return (
    <div>
      

      <button onClick={handleLogout}
      
      className="
 bg-blue-600
 text-white
 px-5
 py-2
 font-bold
 italic
 rounded-lg
 hover:bg-blue-700
 mt-3
 transition
 ">
        🚪 Log Out
      </button>
    </div>
  );
}

export default Logout;