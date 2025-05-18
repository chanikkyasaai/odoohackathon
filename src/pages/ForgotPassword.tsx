import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login"
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 rounded-lg p-8 shadow">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        {sent ? (
          <div>
            <p className="mb-4">Check your email for a password reset link.</p>
            <Link to="/login" className="text-blue-500">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="w-full p-2 rounded bg-black/40 border border-gray-700"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {error && <div className="text-red-500">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Send Reset Link</button>
          </form>
        )}
      </div>
    </div>
  );
} 