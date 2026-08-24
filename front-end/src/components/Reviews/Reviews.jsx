import React, { useState, useEffect } from "react";
import ReviewCard from "./ReviewCard";
import { API_BASE_URL, getImageUrl } from "../../api/apiConfig";
import "./Reviews.css";

function Reviews() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/reviews/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }
        return res.json();
      })
      .then((data) => {
        const mappedData = data.map((item) => ({
          ...item,
          rating: Number(item.rating),
          image: getImageUrl(item.image)
        }));
        setTestimonials(mappedData);
      })
      .catch((error) => {
        console.error("Error loading reviews:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

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

