import React from "react";
import Navbar from "../components/Navbar";

const Projects: React.FC = () => (
  <div>
    <Navbar />
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="flex justify-between items-center mb-4">
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">+ New Project</button>
        <input type="text" placeholder="Search projects..." className="p-2 rounded bg-black/40 border border-gray-700 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ProjectCard components will go here */}
      </div>
    </div>
  </div>
);

export default Projects;