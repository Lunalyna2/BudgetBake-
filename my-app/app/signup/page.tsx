"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showInvalidInput, setShowInvalidInput] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setShowInvalidInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasEmptyField = Object.values(formData).some((value) => !value.trim());

    if (hasEmptyField || formData.password !== formData.confirmPassword) {
      setShowInvalidInput(true);
      return;
    }

    console.log("Sign‑Up Data:", formData);
    router.push("/cost_calculator");
  };

  const isInvalid = showInvalidInput;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">
          SIGN UP
        </h1>

        {showInvalidInput && (
          <p className="mb-4 text-center text-sm font-medium text-red-500">Invalid input</p>
        )}

        {[
          { name: "fullName", label: "Full Name", type: "text", placeholder: "Name" },
          { name: "username", label: "Username", type: "text", placeholder: "Username" },
          { name: "email", label: "Email", type: "email", placeholder: "johndoe@gmail.com" },
          { name: "password", label: "Password", type: "password", placeholder: "Password" },
          { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm Password" },
        ].map((field) => (
          <div key={field.name} className="mb-4">
            <label
              htmlFor={field.name}
              className="block text-gray-700 font-medium mb-1 capitalize"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={(formData as Record<string, string>)[field.name]}
              onChange={handleChange}
              className={`w-full p-2 border-2 rounded-md bg-gray-50 text-black focus:outline-none ${
                isInvalid ? "border-red-400 focus:border-red-500" : "border-transparent focus:border-pink-500"
              }`}
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full py-2 mt-2 rounded-md text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition"
        >
          Enter
        </button>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-pink-600 underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
