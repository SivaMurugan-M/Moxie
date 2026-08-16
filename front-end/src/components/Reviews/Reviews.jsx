import React from "react";
import ReviewCard from "./ReviewCard";
import "./Reviews.css";

// Import reviews data
import testimonials from "../../data/reviews";

function Reviews() {
  return (
    <section className="rating-section py-5">
      <div className="container">
        {/* Section Heading */}
        <h2 className="rating-heading text-center mb-2">Customers are saying us?</h2>

        {/* Continuous Marquee Carousel Wrapper */}
        <div className="reviews-marquee-wrapper">
          <div className="reviews-marquee-track">
            {testimonials.map((item) => (
              <ReviewCard
                key={`orig-${item.id}`}
                review={item}
                position="side"
              />
            ))}
            {/* Duplicate list to create a seamless looping effect */}
            {testimonials.map((item) => (
              <ReviewCard
                key={`dup-${item.id}`}
                review={item}
                position="side"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Reviews;
