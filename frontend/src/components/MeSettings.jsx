import React, { useState, useEffect } from "react";
import api, { setAuthToken } from "../../utils/authService";

const MeSettings = ({ user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);

      // Adiciona a foto se foi selecionada
      if (selectedPhoto) {
        formDataToSend.append("photo", selectedPhoto);
      }

      const response = await api.patch("/users/updateMe", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      // Limpa a foto selecionada e preview
      setSelectedPhoto(null);
      setPhotoPreview(null);

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords don't match!" });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.patch("/users/updateMyPassword", {
        passwordCurrent: formData.currentPassword,
        password: formData.newPassword,
        passwordConfirm: formData.confirmPassword,
      });

      

      const loginResponse = await api.post("/users/login", {
        email: user.email,
        password: formData.newPassword,
      });

      

      const newToken = loginResponse.token;
      const updatedUser = loginResponse.data.user;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setAuthToken(newToken);

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setMessage({
        type: "success",
        text: "Password updated successfully! You're still logged in.",
      });

      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);

      setMessage({
        type: "error",
        text: error.message || "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-blue-500 mb-8">
        YOUR ACCOUNT SETTINGS
      </h1>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-blue-100 text-blue-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmitProfile} className="mb-8">
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Photo
          </label>
          <div className="flex items-center space-x-4">
            <img
              src={
                photoPreview ||
                (user?.photo
                  ? `/img/users/${user.photo}?t=${Date.now()}`
                  : `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff&size=128`)
              }
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="text-blue-500 hover:text-blue-600 font-semibold cursor-pointer"
            >
              Choose new photo
            </label>
            {selectedPhoto && (
              <span className="text-sm text-gray-600">
                {selectedPhoto.name}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? "SAVING..." : "SAVE SETTINGS"}
        </button>
      </form>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Change Password
        </h2>

        <form onSubmit={handleSubmitPassword}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MeSettings;
