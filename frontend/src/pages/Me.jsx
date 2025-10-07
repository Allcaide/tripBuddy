// frontend/src/pages/Me.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MeSidebar from "../components/MeSidebar";
import MeSettings from "../components/MeSettings";
import MeBookings from "../components/MeBookings";
import MeReviews from "../components/MeReviews";
import MeBilling from "../components/MeBilling";

function Me() {
  const [activeSection, setActiveSection] = useState("settings");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "settings":
        return <MeSettings user={user} />;
      case "bookings":
        return <MeBookings user={user} />;
      case "reviews":
        return <MeReviews user={user} />;
      case "billing":
        return <MeBilling user={user} />;
      default:
        return <MeSettings user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 flex">
        <MeSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          userName={user?.name}
        />

        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">{renderSection()}</div>
        </div>
      </div>
    </div>
  );
}

export default Me;
