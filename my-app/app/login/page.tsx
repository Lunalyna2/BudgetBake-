"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login Data:", formData);

    // ✅ Redirect to cost calculator after submit
    router.push("/cost_calculator");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">
          LOG IN
        </h1>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="johndoe@gmail.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border-2 rounded-md border-transparent 
                       focus:outline-none focus:border-pink-500 bg-gray-50 text-black"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border-2 rounded-md border-transparent 
                       focus:outline-none focus:border-pink-500 bg-gray-50 text-black"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-md text-white font-semibold 
                     bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition"
        >
          Enter
        </button>

        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-purple-600 underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
