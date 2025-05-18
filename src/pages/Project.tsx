import React from "react";
import Navbar from "../components/Navbar";

const Project: React.FC = () => (
  <div>
    <Navbar />
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Project Details</h1>
      {/* Tasks and team management UI will go here */}
    </div>
  </div>
);

export default Project;
