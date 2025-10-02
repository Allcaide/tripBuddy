import React from "react";

const TDPDetails = ({ tour }) => {
  if (!tour) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      {/* Quick Facts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">QUICK FACTS</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="mr-4">📅</span>
            <div>
              <strong>NEXT DATE</strong>
              <p>
                {tour.startDates?.[0]
                  ? new Date(tour.startDates[0]).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4">📈</span>
            <div>
              <strong>DIFFICULTY</strong>
              <p className="capitalize">{tour.difficulty}</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4">👥</span>
            <div>
              <strong>PARTICIPANTS</strong>
              <p>{tour.maxGroupSize} People</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4">⭐</span>
            <div>
              <strong>RATING</strong>
              <p>{tour.ratingsAverage} / 5</p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div>
        <h2 className="text-2xl font-bold text-blue-500 mb-4">
          ABOUT THE {tour.name?.toUpperCase()}
        </h2>
        <p className="text-gray-700 leading-relaxed">{tour.description}</p>
      </div>
    </div>
  );
};

export default TDPDetails;
