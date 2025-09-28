import React, { useState } from "react";

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true); // true = login, false = signup
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Login:", {
        email: formData.email,
        password: formData.password,
      });
    } else {
      console.log("Signup:", formData);
    }
    // Integrar com a API aqui
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-bold"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field (only for signup) */}
          {!isLogin && (
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 backdrop-blur-sm"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 backdrop-blur-sm"
              required
            />
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 backdrop-blur-sm"
              required
            />
          </div>

          {/* Confirm Password (only for signup) */}
          {!isLogin && (
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 backdrop-blur-sm"
                required
              />
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all backdrop-blur-sm"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle between login/signup */}
        <div className="text-center mt-6">
          <p className="text-white/70">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-300 font-semibold underline mt-1"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
