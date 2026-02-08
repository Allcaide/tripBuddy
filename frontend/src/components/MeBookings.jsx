import React, { useEffect, useState } from "react";
import api from "../../utils/api";

function MeBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/bookings/my-bookings");
        setBookings(response.data.data.data);
        setError(null);
      } catch (err) {
        console.error("🔍 Erro ao buscar bookings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="p-4">Carregando bookings...</div>;
  if (error) return <div className="p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Minhas Reservas</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">Nenhuma reserva encontrada</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="border rounded-lg p-4 shadow">
              <h3 className="font-bold text-lg">{booking.tour.name}</h3>
              <p className="text-gray-600">Preço: €{booking.price}</p>
              <p className="text-gray-600">
                Data: {new Date(booking.createdAt).toLocaleDateString("pt-PT")}
              </p>
              <p
                className={`font-semibold ${booking.paid ? "text-green-600" : "text-red-600"}`}
              >
                {booking.paid ? "✅ Pago" : "❌ Pendente"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MeBookings;
