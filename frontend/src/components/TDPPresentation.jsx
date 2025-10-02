import React from "react";

const TDPPresentation = ({ tour }) => {
  if (!tour) return null;

  return (
    <div className="bg-blue-500 text-white p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">{tour.name}</h1>
      <div className="flex justify-center items-center space-x-8">
        <div className="flex items-center">
          <span>{tour.duration} DAYS</span>
        </div>
        <div className="flex items-center">
          <span className="mr-0">📍</span>
          <span>{tour.startLocation?.description || "Location"}</span>
        </div>
      </div>
    </div>
  );
};

export default TDPPresentation;
