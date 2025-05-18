import React from "react";
import Navbar from "../components/Navbar";

const Settings: React.FC = () => (
  <div>
    <Navbar />
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white/10 rounded-lg shadow p-6 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <select className="w-full p-2 rounded bg-black/40 border border-gray-700">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Notification Preferences</label>
          <input type="checkbox" className="mr-2" id="emailNotif" />
          <label htmlFor="emailNotif">Email Notifications</label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select className="w-full p-2 rounded bg-black/40 border border-gray-700">
            <option>English</option>
            <option>French</option>
            <option>Spanish</option>
          </select>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded self-end">Save Settings</button>
      </div>
    </div>
  </div>
);

export default Settings;