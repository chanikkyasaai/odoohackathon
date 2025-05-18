import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => (
  <nav className="bg-gray-900 text-white px-6 py-4 flex gap-6 items-center">
    <Link to="/projects" className="hover:underline">Projects</Link>
    <Link to="/my-tasks" className="hover:underline">My Tasks</Link>
    <Link to="/settings" className="hover:underline">Settings</Link>
    <Link to="/empty" className="hover:underline">Empty</Link>
  </nav>
);

export default Navbar; 