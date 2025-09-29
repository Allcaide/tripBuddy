import React, { useState } from "react";
import { authService } from "./../../utils/authService.js";

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpar erros quando user começa a escrever
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError("");

    try {
      // Validação local para signup
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match! Please check and try again.");
          setLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }
      }

      let response;

      if (isLogin) {
        // LOGIN
        response = await authService.login(formData.email, formData.password);
      } else {
        // SIGNUP
        response = await authService.signup(
          formData.name,
          formData.email,
          formData.password,
          formData.confirmPassword,
        );
      }

      // SUCCESS! 🎉
      setSuccess(
        isLogin ? "Login successful!" : "Account created successfully!",
      );

      // Notificar o Navbar que login foi bem sucedido
      setTimeout(() => {
        onAuthSuccess(response);
        onClose();
        setSuccess("");
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      }, 1500);
    } catch (error) {
      // Tratamento específico de erros do backend
      const errorMessage = error.message;

      if (errorMessage.includes("Incorrect email or password")) {
        setError(
          "❌ Incorrect email or password. Please check your credentials and try again.",
        );
      } else if (
        errorMessage.includes("duplicate key error") ||
        errorMessage.includes("E11000")
      ) {
        setError(
          "❌ An account with this email already exists. Please use a different email or try logging in.",
        );
      } else if (
        errorMessage.includes("Password") &&
        errorMessage.includes("match")
      ) {
        setError("❌ Passwords don't match! Please check and try again.");
      } else if (errorMessage.includes("validation failed")) {
        setError("❌ Please check all fields are filled correctly.");
      } else if (
        errorMessage.includes("Network Error") ||
        errorMessage.includes("fetch")
      ) {
        setError(
          "❌ Connection error. Please check your internet and try again.",
        );
      } else {
        setError(
          `❌ ${errorMessage || "Something went wrong! Please try again."}`,
        );
      }

      // Log para debug
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
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

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/40 rounded-lg text-center">
            <div className="text-green-400 text-4xl mb-2">✓</div>
            <p className="text-green-300 font-medium">{success}</p>
          </div>
        )}

        {!success && (
          <>
            {/* Title */}
            <h2 className="text-3xl font-bold text-white text-center mb-6">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>

            {/* Error Message - MELHORADO */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="text-red-400 text-xl">⚠️</div>
                  <div>
                    <p className="text-red-300 text-sm font-medium">{error}</p>
                    {error.includes("Incorrect email or password") && (
                      <p className="text-red-200 text-xs mt-2">
                        💡 Double-check your email and password, or try signing
                        up if you don't have an account.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                {!isLogin && (
                  <p className="text-white/50 text-xs mt-1">
                    Password must be at least 8 characters long
                  </p>
                )}
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
                  {formData.password &&
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">
                        ⚠️ Passwords don't match
                      </p>
                    )}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600/80 hover:bg-blue-600 disabled:bg-gray-500/50 text-white font-semibold py-3 rounded-lg transition-all backdrop-blur-sm flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Toggle between login/signup */}
            <div className="text-center mt-6">
              <p className="text-white/70">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  });
                }}
                className="text-blue-400 hover:text-blue-300 font-semibold underline mt-1"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
