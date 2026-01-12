import { loadStripe } from "@stripe/stripe-js";

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export async function bookTour(tourId, token) {
  const res = await fetch(
    `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message || "Failed to create checkout session");
  }

  const data = await res.json();

  if (!data?.session?.url) {
    throw new Error("Missing session.url in response");
  }

  window.location.assign(data.session.url);
}

// ✅ Se quiseres usar Stripe.js no futuro, mantém
export const stripePromise = pk ? loadStripe(pk) : null;
