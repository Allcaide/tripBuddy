import React from "react";

const TDPReviews = ({ tour }) => {
  if (!tour) return null;

  return (
    <div className="bg-blue-500 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tour.reviews?.map((review, index) => (
          <div key={index} className="bg-white p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <img
                src={`http://localhost:3000/img/users/${
                  review.user?.photo || "default.jpg"
                }`}
                alt={review.user?.name || "User"}
                className="w-12 h-12 rounded-full mr-4"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    review.user?.name || "User",
                  )}&background=3b82f6&color=fff&size=48&rounded=true`;
                }}
              />
              <div>
                <h4 className="font-bold">
                  {review.user?.name?.toUpperCase() || "ANONYMOUS"}
                </h4>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">{review.review}</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= review.rating ? "text-blue-500" : "text-gray-300"
                  }
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TDPReviews;
