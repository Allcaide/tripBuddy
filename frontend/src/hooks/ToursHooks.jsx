import { useState, useEffect } from "react";
import api from "../../utils/authService";

export const useTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/tours");

        console.log("✅ Tours response:", response.data);

        // Guarda os dados no estado
        setTours(response.data.data);
      } catch (error) {
        console.error("🚨 Error fetching tours:", error);
        console.error("🚨 Error message:", error.message);
        console.error("🚨 Response error:", error.response?.data);

        // Guarda o erro no estado
        setError(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  return { tours, loading, error };
};
