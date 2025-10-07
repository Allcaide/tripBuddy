// frontend/src/components/MeSidebar.jsx
import React from "react";

const MeSidebar = ({ activeSection, setActiveSection, userName }) => {
  const menuItems = [
    { id: "settings", label: "SETTINGS", icon: "⚙️" },
    { id: "bookings", label: "MY BOOKINGS", icon: "🎫" },
    { id: "reviews", label: "MY REVIEWS", icon: "⭐" },
    { id: "billing", label: "BILLING", icon: "💳" },
  ];

  return (
    <div className="w-80 bg-gradient-to-b from-blue-400 to-blue-500 min-h-screen p-8">
      {userName && (
        <div className="text-white mb-8">
          <h2 className="text-2xl font-bold">Hello, {userName}!</h2>
        </div>
      )}

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeSection === item.id
                ? "bg-white text-blue-500 shadow-lg"
                : "text-white hover:bg-white hover:bg-opacity-20"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MeSidebar;
