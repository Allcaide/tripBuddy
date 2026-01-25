import React, { useEffect, useState } from "react";
import api from "../../utils/api";

function MeReviews() {
  const [myReviews, setMyReviews] = useState([]);
  const [availableForReview, setAvailableForReview] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [expandedForm, setExpandedForm] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    review: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Buscar minhas reviews
  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await api.get("/reviews/my-reviews");
        console.log("🔍 Minhas reviews:", response.data.data.data);
        setMyReviews(response.data.data.data || []);
      } catch (err) {
        console.error("🔍 Erro ao buscar minhas reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchMyReviews();
  }, []);

  // Buscar bookings e determinar quais estão disponíveis para review
  useEffect(() => {
    const fetchBookingsAndCheckReviews = async () => {
      try {
        setLoadingBookings(true);
        const bookingsResponse = await api.get("/bookings/my-bookings");
        const bookings = bookingsResponse.data.data.data || [];

        const now = new Date();
        const available = [];

        for (const booking of bookings) {
          // ✅ Usa a data da tour (startDates[0])
          const tourStartDate = new Date(booking.tour.startDates?.[0]);
          const tourDuration = booking.tour.duration || 1;

          // Calcula data final da tour
          const tourEndDate = new Date(tourStartDate);
          tourEndDate.setDate(tourEndDate.getDate() + tourDuration);

          // Disponível 24h após o fim da tour
          const availableFromDate = new Date(tourEndDate);
          availableFromDate.setDate(availableFromDate.getDate() + 1);

          console.log("🔍 Tour end date:", tourEndDate);
          console.log("🔍 Available from:", availableFromDate);
          console.log("🔍 Now:", now);
          console.log("🔍 Can review?", now >= availableFromDate);

          // Verifica se já passaram 24h do fim da tour
          if (now >= availableFromDate) {
            // Verifica se já tem review para este tour
            const hasReview = myReviews.some(
              (review) => review.tour._id === booking.tour._id,
            );

            if (!hasReview) {
              available.push({
                ...booking,
                canReview: true,
                tourEndDate,
              });
            }
          }
        }

        console.log("🔍 Disponíveis para review:", available);
        setAvailableForReview(available);
      } catch (err) {
        console.error("🔍 Erro ao buscar bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (myReviews.length >= 0) {
      fetchBookingsAndCheckReviews();
    }
  }, [myReviews]);

  // Submeter review
const handleSubmitReview = async (tourId) => {
  if (!formData.review.trim() || formData.rating < 1 || formData.rating > 5) {
    alert("Por favor, preencha todos os campos correctamente");
    return;
  }

  try {
    setSubmitting(true);
    // para usar tourId na rota (se existir) ou envia no body
    const response = await api.post("/reviews", {
      tour: tourId,
      rating: parseInt(formData.rating),
      review: formData.review,
    });

    console.log("🔍 Review criada com sucesso:", response.data.data.data);
    // resto...
  } catch (err) {
    console.error("🔍 Erro ao criar review:", err.response?.data || err);
    alert(
      "Erro ao criar review: " + (err.response?.data?.message || err.message),
    );
  } finally {
    setSubmitting(false);
  }
};

  const handleUpdateReview = async (reviewId, tourId) => {
    if (!formData.review.trim() || formData.rating < 1 || formData.rating > 5) {
      alert("Por favor, preencha todos os campos correctamente");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.patch(`/reviews/${reviewId}`, {
        rating: parseInt(formData.rating),
        review: formData.review,
      });

      console.log("🔍 Review atualizada com sucesso:", response.data.data.data);

      // Atualiza a lista de reviews
      setMyReviews(
        myReviews.map((r) =>
          r._id === reviewId ? response.data.data.data : r,
        ),
      );

      // Limpa o formulário
      setFormData({ rating: 5, review: "" });
      setExpandedForm(null);
    } catch (err) {
      console.error("🔍 Erro ao atualizar review:", err);
      alert("Erro ao atualizar review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Tem a certeza que quer apagar esta review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      console.log("🔍 Review apagada com sucesso");

      // Remove da lista
      setMyReviews(myReviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error("🔍 Erro ao apagar review:", err);
      alert("Erro ao apagar review");
    }
  };

  if (loadingReviews || loadingBookings) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Minhas Reviews</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLUNA ESQUERDA - Reviews já feitas */}
        <div>
          <h3 className="text-xl font-bold mb-4">
            Reviews Feitas ({myReviews.length})
          </h3>
          {myReviews.length === 0 ? (
            <p className="text-gray-500">Nenhuma review feita ainda</p>
          ) : (
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div
                  key={review._id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{review.tour.name}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setExpandedForm(`edit-${review._id}`);
                          setFormData({
                            rating: review.rating,
                            review: review.review,
                          });
                        }}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500 mr-2">
                      {"⭐".repeat(review.rating)}
                    </span>
                    <span className="text-gray-700">{review.rating}/5</span>
                  </div>

                  <p className="text-gray-700">{review.review}</p>

                  {/* Formulário de edição expandível */}
                  {expandedForm === `edit-${review._id}` && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Rating: {formData.rating}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={formData.rating}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rating: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>

                      <textarea
                        value={formData.review}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            review: e.target.value,
                          })
                        }
                        placeholder="Atualize sua review..."
                        className="w-full p-2 border rounded text-sm"
                        rows="3"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateReview(review._id, review.tour._id)
                          }
                          disabled={submitting}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submitting ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={() => {
                            setExpandedForm(null);
                            setFormData({ rating: 5, review: "" });
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUNA DIREITA - Disponíveis para review */}
        <div>
          <h3 className="text-xl font-bold mb-4">
            Disponíveis para Review ({availableForReview.length})
          </h3>
          {availableForReview.length === 0 ? (
            <p className="text-gray-500">
              Nenhuma viagem disponível para review
            </p>
          ) : (
            <div className="space-y-4">
              {availableForReview.map((booking) => (
                <div
                  key={booking._id}
                  className="border rounded-lg p-4 bg-blue-50"
                >
                  <h4 className="font-bold text-lg mb-2">
                    {booking.tour.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Data da tour:{" "}
                    {new Date(booking.tour.startDates?.[0]).toLocaleDateString(
                      "pt-PT",
                    )}
                    {booking.tour.duration && (
                      <>
                        {" "}
                        - {booking.tour.duration} dia
                        {booking.tour.duration > 1 ? "s" : ""}
                      </>
                    )}
                  </p>

                  {/* Formulário expandível */}
                  {expandedForm === `new-${booking._id}` ? (
                    <div className="space-y-3 bg-white p-3 rounded border">
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Rating: {formData.rating}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={formData.rating}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rating: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>

                      <textarea
                        value={formData.review}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            review: e.target.value,
                          })
                        }
                        placeholder="Escreva sua review aqui..."
                        className="w-full p-2 border rounded text-sm"
                        rows="4"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitReview(booking.tour._id)}
                          disabled={submitting}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {submitting ? "Enviando..." : "Enviar Review"}
                        </button>
                        <button
                          onClick={() => {
                            setExpandedForm(null);
                            setFormData({ rating: 5, review: "" });
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setExpandedForm(`new-${booking._id}`);
                        setFormData({ rating: 5, review: "" });
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
                    >
                      + Fazer Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MeReviews;
