import React, { useState, useEffect } from "react"; // ✅ ADICIONAR useState, useEffect
import { useParams } from "react-router"; // ✅ ADICIONAR useParams
import Navbar from "../components/Navbar";
import api from "../../utils/authService";

function ToursDetailPage() {
  const [tour, setTour] = useState(null); // ✅ ESTADO para dados
  const { tourId } = useParams(); // ✅ PEGAR ID da URL

  useEffect(() => {
    const fetchTour = async () => {
      // ✅ FUNÇÃO async separada
      try {
        const response = await api.get(`/tours/${tourId}`);
        console.log("Fetching Tour", response); // ✅ CONSOLA
        setTour(response); // ✅ GUARDAR dados
      } catch (err) {
        console.error("Error:", err);
      }
    };

    if (tourId) fetchTour();
  }, [tourId]); // ✅ DEPENDÊNCIA

  return (
    <div>
      <Navbar />

      {/* ✅ JSON RAW NO ECRÃ */}
      <pre
        style={{ padding: "20px", fontSize: "12px", whiteSpace: "pre-wrap" }}
      >
        {JSON.stringify(tour, null, 2)}
      </pre>
    </div>
  );
}

export default ToursDetailPage;
