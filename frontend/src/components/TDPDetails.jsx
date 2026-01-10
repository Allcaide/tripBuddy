import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../utils/authService";

const TDPDetails = ({ tour }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Verificar se user está logado quando componente monta (igual à Navbar)
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  if (!tour) return null;

  const handleBookTour = async () => {
    if (!user) {
      // Redireciona para login abrindo o modal
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    try {
      setLoading(true);

      // Obter token do localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        window.dispatchEvent(new Event("openLoginModal"));
        return;
      }

      // Chama a API para criar checkout session
      const response = await fetch(
        `http://localhost:3000/api/v1/bookings/checkout-session/${tour._id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      // Redireciona para Stripe Checkout
      window.location.href = data.session.url;
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to start booking process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      {/* Quick Facts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">QUICK FACTS</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="mr-4">📅</span>
            <div>
              <strong>NEXT DATE</strong>
              <p>
                {tour.startDates?.[0]
                  ? new Date(tour.startDates[0]).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4">📈</span>
            <div>
              <strong>DIFFICULTY</strong>
              <p className="capitalize">{tour.difficulty}</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4">👥</span>
            <div>
              <strong>PARTICIPANTS</strong>
              <p>{tour.maxGroupSize} People</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4">⭐</span>
            <div>
              <strong>RATING</strong>
              <p>{tour.ratingsAverage} / 5</p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div>
        <h2 className="text-2xl font-bold text-blue-500 mb-4">
          ABOUT THE {tour.name?.toUpperCase()}
        </h2>
        <p className="text-gray-700 leading-relaxed mb-6">{tour.description}</p>

        {/* 🎯 Booking Button */}
        <div className="mt-8">
          <button
            onClick={handleBookTour}
            disabled={loading}
            className={`
              w-full px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300
              ${
                user
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
              }
              ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : user ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">💳</span>
                Book {tour.name} - €{tour.price}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">🔐</span>
                Log in to book {tour.name}
              </div>
            )}
          </button>

          {/* Price display */}
          {user && (
            <div className="text-center mt-4 text-gray-600">
              <p className="text-sm">🔒 Secure payment with Stripe</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TDPDetails;
