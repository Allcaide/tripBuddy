import React from "react";
import TourCard from "./TourCard";

const ToursGrid = ({ tours, loading, error, errorType }) => {
  const renderErrorMessage = () => {
    const errorConfig = {
      AUTH_REQUIRED: {
        title: "Login Required",
        buttonText: "Log In",
        buttonAction: () => {
          window.dispatchEvent(new CustomEvent("openLoginModal"));
        },
      },
      ADMIN_REQUIRED: {
        title: "Admin Access Required",
        buttonText: "Contact Support",
        buttonAction: () => (window.location.href = "/contact"),
      },
      GUIDE_REQUIRED: {
        title: "Guide Access Required",
        buttonText: "Apply to be a Guide",
        buttonAction: () => (window.location.href = "/become-guide"),
      },
      TOKEN_INVALID: {
        title: "Session Expired",
        buttonText: "Log In Again",
        buttonAction: () => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new CustomEvent("openLoginModal"));
        },
      },
      GENERAL: {
        title: "Something went wrong",
        buttonText: "Try Again",
        buttonAction: () => window.location.reload(),
      },
    };

    const config = errorConfig[errorType] || errorConfig.GENERAL;

    return (
      <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-4">
        <div className="text-4xl mb-4">{config.icon}</div>
        <h2 className="text-xl font-bold text-red-700 mb-2">{config.title}</h2>
        {/* ✅ USAR A MENSAGEM EXATA DO BACKEND */}
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={config.buttonAction}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {config.buttonText}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading amazing tours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center pt-20">
        {renderErrorMessage()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Espaçamento para navbar floating */}
      <div className="pt-24 pb-16">
        {/* Header Section */}
        <div className="text-center mb-16 px-4">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Discover Amazing Tours
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore breathtaking destinations with our curated collection of
            unforgettable adventures around the world
          </p>
        </div>

        {/* Tours Grid */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div
              className="grid gap-6 
              grid-cols-1 
              sm:grid-cols-2 
              lg:grid-cols-3 
              xl:grid-cols-4 
              2xl:grid-cols-5 
              place-items-center"
            >
              {/* ✅ SAFETY CHECK */}
              {Array.isArray(tours) &&
                tours.map((tour) => <TourCard key={tour._id} tour={tour} />)}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {Array.isArray(tours) && tours.length === 0 && !loading && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏔️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No tours available yet
            </h3>
            <p className="text-gray-500">
              Check back soon for amazing adventures!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursGrid;
