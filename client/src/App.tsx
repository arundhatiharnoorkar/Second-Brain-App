import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Signup from "./pages/Signup";
import Signin from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Toaster />

      

      <Routes>

        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/signin"
          element={<Signin />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );

}

export default App;