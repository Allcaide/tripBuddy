import React from "react";

const TDPPhotosandMap = ({ tour }) => {
  if (!tour) return null;

  return (
    <div className="p-8">
      {/* Tour Guides */}
      {tour.guides && tour.guides.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-3">
            YOUR TOUR GUIDES
          </h2>
          <div className="flex overflow-x-auto space-x-4 px-4 py-2">
            {tour.guides.map((guide, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-white rounded-lg shadow-md p-3 w-60"
              >
                <div className="flex items-center">
                  <img
                    src={`http://localhost:3000/img/users/${
                      guide.photo || "default.jpg"
                    }`}
                    alt={guide.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        guide.name || "Guide",
                      )}&background=3b82f6&color=fff&size=48&rounded=true`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-800 truncate">
                      {guide.name?.toUpperCase()}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        guide.role === "lead-guide"
                          ? "bg-blue-500 text-white"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {guide.role === "lead-guide" ? "LEAD" : "GUIDE"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {tour.images?.map((image, index) => (
          <img
            key={index}
            src={`http://localhost:3000/img/tours/${image}`}
            alt={`Tour ${index + 1}`}
            className="w-full h-64 object-cover rounded-lg"
          />
        ))}
      </div>

      {/* Map Placeholder */}
      <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🗺️</span>
          <p className="text-gray-600">Interactive Map</p>
          <p className="text-sm text-gray-500">
            Tour locations will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
};

export default TDPPhotosandMap;
