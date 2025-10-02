import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import api from "../../utils/authService";
import TDPPresentation from "../components/TDPPresentation";
import TDPDetails from "../components/TDPDetails";
import TDPPhotosandMap from "../components/TDPPhotosandMap";
import TDPReviews from "../components/TDPReviews";

function ToursDetailPage() {
  const [tour, setTour] = useState(null); // ✅ ESTADO para dados
  const { tourId } = useParams(); // PEGAR ID da URL, destructuring

  useEffect(() => {
    const fetchTour = async () => {
      // ✅ FUNÇÃO async separada
      try {
        const response = await api.get(`/tours/${tourId}`);
        console.log("Fetching Tour", response);
        console.log("Tour data:", response.data.doc);

        setTour(response.data.doc); // ✅ GUARDAR dados da tour
      } catch (err) {
        console.error("Error:", err);
      }
    };

    if (tourId) fetchTour();
  }, [tourId]); // ✅ DEPENDÊNCIA

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20">
        <TDPPresentation tour={tour} />
        <TDPDetails tour={tour} />
        <TDPPhotosandMap tour={tour} />
        <TDPReviews tour={tour} />

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
