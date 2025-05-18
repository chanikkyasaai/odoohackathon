import React from "react";
import Navbar from "../components/Navbar";

const ProjectCreateEdit: React.FC = () => (
  <div>
    <Navbar />
    <div className="p-8 max-w-2xl mx-auto">
      <div className="text-gray-400 text-sm mb-2">{"> Projects > New Project"}</div>
      <h1 className="text-2xl font-bold mb-6">Project Create/Edit</h1>
      <form className="bg-white/10 rounded-lg shadow p-6 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input type="text" className="w-full p-2 rounded bg-black/40 border border-gray-700" placeholder="Project name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <input type="text" className="w-full p-2 rounded bg-black/40 border border-gray-700" placeholder="Comma separated tags" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Project Manager</label>
          <select className="w-full p-2 rounded bg-black/40 border border-gray-700">
            <option>Select manager</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Deadline</label>
          <input type="date" className="w-full p-2 rounded bg-black/40 border border-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <div className="flex gap-4">
            <label><input type="radio" name="priority" value="low" className="mr-2" />Low</label>
            <label><input type="radio" name="priority" value="medium" className="mr-2" defaultChecked />Medium</label>
            <label><input type="radio" name="priority" value="high" className="mr-2" />High</label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Image</label>
          <input type="file" className="w-full p-2 rounded bg-black/40 border border-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea className="w-full p-2 rounded bg-black/40 border border-gray-700" rows={4} placeholder="Project description" />
        </div>
        <div className="flex gap-4 justify-end">
          <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Discard</button>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Save</button>
        </div>
      </form>
    </div>
  </div>
);

export default ProjectCreateEdit;