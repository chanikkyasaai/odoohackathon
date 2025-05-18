
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StarfieldBackground } from "@/components/StarfieldBackground";

// Redirect users from Index to Login 
export default function Index() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/login');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <StarfieldBackground />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">SynergySphere</h1>
        <p className="text-xl text-gray-400">Redirecting to login...</p>
      </div>
    </div>
  );
}
