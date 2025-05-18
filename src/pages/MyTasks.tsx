import React from "react";
import Navbar from "../components/Navbar";

const MyTasks: React.FC = () => (
  <div>
    <Navbar />
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
      {/* MyTaskCard components will go here */}
    </div>
  </div>
);

export default MyTasks; 