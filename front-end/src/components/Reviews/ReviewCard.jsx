import React from "react";
import "./ReviewCard.css";

function ReviewCard({ review, position }) {
  const isActive = position === "active";

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <svg key={i} className="star-icon full" viewBox="0 0 24 24" width="18" height="18" fill="#FFC107">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <svg key={i} className="star-icon half" viewBox="0 0 24 24" width="18" height="18">
            <defs>
              <linearGradient id={`halfGrad-reviews-${review.id}-${i}`}>
                <stop offset="50%" stopColor="#FFC107" />
                <stop offset="50%" stopColor="#E0E0E0" />
              </linearGradient>
            </defs>
            <path fill={`url(#halfGrad-reviews-${review.id}-${i})`} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="star-icon empty" viewBox="0 0 24 24" width="18" height="18" fill="#E0E0E0">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className={`rating-card ${isActive ? "active-card" : "side-card"} position-relative d-flex flex-column justify-content-between`}>
      {/* Card Header */}
      <div className="card-top d-flex justify-content-between align-items-start mb-3">
        <div className="user-info-block d-flex align-items-center">
          <img src={review.image} alt={review.name} className="user-avatar" />
          <div className="ms-3">
            <h4 className="user-name mb-1">{review.name}</h4>
            <div className="stars-container d-flex">
              {renderStars(review.rating)}
            </div>
          </div>
        </div>
        {/* Double Quote SVG */}
        <div className="quote-icon-container">
          <svg className="quote-icon" viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body-text">
        <p className="testimonial-text mb-0">{review.text}</p>
      </div>
    </div>
  );
}

export default ReviewCard;
