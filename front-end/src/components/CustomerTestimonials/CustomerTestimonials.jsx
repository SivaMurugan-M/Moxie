import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BACKEND_URL } from "../../config";
import "./CustomerTestimonials.css";

// Project local profile avatars
import profile1 from "../../assets/images/profile1.png";
import profile2 from "../../assets/images/profile2.png";
import profile3 from "../../assets/images/profile3.png";

const DEFAULT_TESTIMONIALS = [
  {
    id: "testimonial-1",
    name: "Aarav Sharma",
    rating: 5,
    message:
      "The build quality of the Tonino Lamborghini watch blew me away. Super fast delivery and the packaging felt ultra-luxurious. Definitely buying again from Moxie!",
    image: profile1,
  },
  {
    id: "testimonial-2",
    name: "Rohan Kapoor",
    rating: 5,
    message:
      "Found the exact G-Shock series I was looking for. Premium customer service, smooth checkout, and 100% authentic product. Highly recommended for collectors!",
    image: profile2,
  },
  {
    id: "testimonial-3",
    name: "Priya Nair",
    rating: 5,
    message:
      "The 1:18 die-cast Mahindra Thar model has unbelievable detail. Looks amazing on my desk! The entire shopping experience with Moxie was top-notch.",
    image: profile3,
  },
  {
    id: "testimonial-4",
    name: "Vikram Malhotra",
    rating: 5,
    message:
      "Exceptional watch collection with unbeatable deals. The delivery was right on time and customer support answered all my questions instantly. A 5-star experience!",
    image: profile1,
  },
  {
    id: "testimonial-5",
    name: "Ananya Iyer",
    rating: 5,
    message:
      "Moxie is my go-to luxury lifestyle store now. Great warranty, authentic luxury items, and pristine packaging. Truly love the craftsmanship.",
    image: profile2,
  },
];

const getReviewImageUrl = (image) => {
  if (!image) return null;
  try {
    return new URL(image, BACKEND_URL).href;
  } catch {
    return image;
  }
};

export default function CustomerTestimonials() {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/reviews/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item, idx) => ({
            id: item.id || `api-review-${idx}`,
            name: item.name || "Verified Customer",
            rating: Number(item.rating) || 5,
            message: item.text || item.message || "",
            image:
              getReviewImageUrl(item.image) ||
              (idx % 3 === 0 ? profile1 : idx % 3 === 1 ? profile2 : profile3),
          }));
          setTestimonials(mapped);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_TESTIMONIALS seamlessly
      });
  }, []);

  const total = testimonials.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Get 3 consecutive items for the carousel view
  const visibleCards = [
    testimonials[currentIndex % total],
    testimonials[(currentIndex + 1) % total],
    testimonials[(currentIndex + 2) % total],
  ];

  const renderStars = (rating = 5) => {
    const stars = [];
    const count = Math.min(Math.max(Math.round(rating), 1), 5);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`testimonial-star ${i <= count ? "filled" : "empty"}`}
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill={i <= count ? "#f5b800" : "#d1d5db"}
          aria-hidden="true"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <section className="customer-testimonials-section" aria-label="Customer Testimonials">
      <div className="testimonials-container">
        {/* Section Heading */}
        <h2 className="testimonials-heading">Customers are saying us?</h2>

        {/* Carousel Row with Side Arrow Buttons */}
        <div className="testimonials-carousel-wrapper">
          {/* Left Arrow Button */}
          <button
            type="button"
            className="testimonial-nav-btn prev-btn"
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <FiChevronLeft className="nav-btn-icon" aria-hidden="true" />
          </button>

          {/* 3 Testimonial Cards */}
          <div className="testimonials-grid">
            {visibleCards.map((item, index) => {
              const isFeatured = index === 1; // Middle card is the featured card
              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`testimonial-card ${isFeatured ? "featured-card" : "standard-card"} card-slot-${index}`}
                >
                  {/* Card Header: Avatar, Name, Stars & Quote Icon */}
                  <div className="testimonial-card-header">
                    <div className="testimonial-user-meta">
                      <img
                        src={item.image || profile1}
                        alt={item.name}
                        className="testimonial-avatar"
                        onError={(e) => {
                          e.currentTarget.src = profile1;
                        }}
                      />
                      <div className="testimonial-user-details">
                        <h3 className="testimonial-user-name">{item.name}</h3>
                        <div
                          className="testimonial-stars-wrap"
                          aria-label={`${item.rating || 5} out of 5 stars`}
                        >
                          {renderStars(item.rating)}
                        </div>
                      </div>
                    </div>

                    {/* Top Right Quote Icon */}
                    <div className="testimonial-quote-icon" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        width="36"
                        height="36"
                        fill="currentColor"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card Message */}
                  <div className="testimonial-card-body">
                    <p className="testimonial-message">{item.message}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            className="testimonial-nav-btn next-btn"
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <FiChevronRight className="nav-btn-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
