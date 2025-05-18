import React from "react";
import Navbar from "../components/Navbar";

const Empty: React.FC = () => (
  <div>
    <Navbar />
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Coming Soon</h1>
      <p>This page is a placeholder for future features.</p>
    </div>
  </div>
);

export default Empty; 