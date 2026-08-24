"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showInvalidInput, setShowInvalidInput] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setShowInvalidInput(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setShowInvalidInput(true);
      return;
    }

    setShowInvalidInput(false);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (error) {
      console.error("Signup error:", error);
      setShowInvalidInput(true);
      return;
    }

    if (!data.user) {
      console.error("Signup succeeded but no user was returned.");
      setShowInvalidInput(true);
      return;
    }

    const { error: profileError } = await supabase
      .from("users")
      .insert({
        user_id: data.user.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      setShowInvalidInput(true);
      return;
    }

    router.push("/cost_calculator");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-center text-3xl font-bold text-purple-600">SIGN UP</h1>

        {showInvalidInput && (
          <p className="mb-4 text-center text-sm font-medium text-red-500">Invalid input</p>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="mb-1 block font-medium text-gray-700">
            Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={`w-full rounded-md border-2 bg-gray-50 p-2 text-black focus:outline-none ${showInvalidInput ? "border-red-400 focus:border-red-500" : "border-transparent focus:border-pink-500"
              }`}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-1 block font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="johndoe@gmail.com"
            className={`w-full rounded-md border-2 bg-gray-50 p-2 text-black focus:outline-none ${showInvalidInput ? "border-red-400 focus:border-red-500" : "border-transparent focus:border-pink-500"
              }`}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="mb-1 block font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className={`w-full rounded-md border-2 bg-gray-50 p-2 text-black focus:outline-none ${showInvalidInput ? "border-red-400 focus:border-red-500" : "border-transparent focus:border-pink-500"
              }`}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-gradient-to-r from-pink-500 to-purple-500 py-2 font-semibold text-white transition hover:opacity-90"
        >
          Create Account
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
