import { useState, useEffect } from "react";
import api from "../../utils/authService";

export const useTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorType(null);

        const response = await api.get("/tours");

        // Encontrar o array de tours na estrutura
        let toursArray = [];
        if (Array.isArray(response.data)) {
          toursArray = response.data;
        } else if (Array.isArray(response.data?.data)) {
          toursArray = response.data.data;
        } else if (Array.isArray(response.data?.tours)) {
          toursArray = response.data.tours;
        }

        setTours(toursArray);
      } catch (err) {
        console.error("🚨 Error fetching tours:", err);

        // ✅ USAR A MENSAGEM DIRETA DO BACKEND
        const backendMessage = err.message;

        // ✅ DETECTAR TIPO BASEADO NA MENSAGEM DO BACKEND
        if (
          backendMessage.includes("not logged in") ||
          backendMessage.includes("Please log in")
        ) {
          setErrorType("AUTH_REQUIRED");
        } else if (
          backendMessage.includes("admin") ||
          backendMessage.includes("administrator")
        ) {
          setErrorType("ADMIN_REQUIRED");
        } else if (backendMessage.includes("guide")) {
          setErrorType("GUIDE_REQUIRED");
        } else if (
          backendMessage.includes("jwt") ||
          backendMessage.includes("token") ||
          backendMessage.includes("malformed")
        ) {
          setErrorType("TOKEN_INVALID");
        } else {
          setErrorType("GENERAL");
        }

        // ✅ USAR A MENSAGEM EXATA DO BACKEND
        setError(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  return { tours, loading, error, errorType };
};
