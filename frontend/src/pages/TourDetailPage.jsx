// frontend/src/pages/tourDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import api from "../../utils/authService";
import TDPPresentation from "../components/TDPPresentation";
import TDPDetails from "../components/TDPDetails";
import TDPPhotosandMap from "../components/TDPPhotosandMap";
import TDPReviews from "../components/TDPReviews";

function ToursDetailPage() {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams(); // ✅ Pega o slug da URL

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Fetching tour with slug:", slug);

        // ✅ NOVO ENDPOINT PARA SLUG
        const response = await api.get(`/tours/slug/${slug}`);

        console.log("✅ Tour found:", response);
        setTour(response.data.doc);
      } catch (err) {
        console.error("🚨 Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchTour();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tour details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 flex justify-center items-center min-h-[60vh]">
          <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Tour not found
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-600 mb-4">Slug: {slug}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20">
        {tour && (
          <>
            <TDPPresentation tour={tour} />
            <TDPDetails tour={tour} />
            <TDPPhotosandMap tour={tour} />
            <TDPReviews tour={tour} />
          </>
        )}

        {/* Debug section */}
        <details className="p-4 bg-gray-100">
          <summary className="cursor-pointer font-bold">🔍 Debug Data</summary>
          <pre className="text-xs mt-4 overflow-auto">
            {JSON.stringify(tour, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

export default ToursDetailPage;
