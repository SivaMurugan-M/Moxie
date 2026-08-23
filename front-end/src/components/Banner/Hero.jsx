import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";
import Banner from "../../assets/images/banner2.png";
import BannerVideo from "../../assets/Video/banner_video.mp4";
import Offer from "./Offer";

const API_ORIGIN = "http://127.0.0.1:8000";

const getBannerImageUrl = (image) => {
  if (!image) return Banner;

  // The backend may serialize an ImageField as either a full URL or a
  // relative /media path. Resolve both forms without duplicating the host.
  try {
    return new URL(image, API_ORIGIN).href;
  } catch {
    return image;
  }
};


function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef([]);

  useEffect(() => {
    fetch(`${API_ORIGIN}/api/banners/`)
      .then(res => res.json())
      .then(data => {
        const mappedSlides = data.map((b) => {
          let titleElement = b.title;
          const words = b.title.split(" ");
          if (words.length > 2) {
            const splitIndex = Math.ceil(words.length / 2);
            const line1 = words.slice(0, splitIndex).join(" ");
            const line2 = words.slice(splitIndex).join(" ");
            titleElement = (
              <>
                {line1}
                <br />
                <span>{line2}</span>
              </>
            );
          }

          return {
            type: b.display_order === 1 ? "video" : "image",
            tag: b.subtitle || "TRENDING TECH",
            title: titleElement,
            description: b.display_order === 1
              ? "Discover premium watches, smart accessories and everyday essentials designed for your lifestyle."
              : b.display_order === 3
              ? "Shop premium watches, earbuds, shoes and everyday accessories at great prices."
              : "Upgrade your routine with our top trending tech accessories and everyday gear.",
            buttonText: (b.button_text || "Shop Now") + " →",
            image: getBannerImageUrl(b.image),
            video: BannerVideo,
            link: b.button_link || "/products/watches",
            background: b.display_order === 1 ? "#0c0c0c" : b.display_order === 3 ? "#FDB101" : b.display_order === 4 ? "#111111" : "#f5f5f7",
            textColor: b.display_order === 1 || b.display_order === 4 ? "#ffffff" : "#000000",
            spanColor: b.display_order === 3 ? "#ffffff" : "#FDB101",
            descColor: b.display_order === 1 || b.display_order === 4 ? "#e2e8f0" : b.display_order === 3 ? "#1a1a1a" : "#555555",
            btnBackground: b.display_order === 1 || b.display_order === 4 ? "#ffffff" : "#000000",
            btnTextColor: b.display_order === 1 || b.display_order === 4 ? "#0c0c0c" : "#ffffff",
            duration: 5000,
          };
        });
        setBanners(mappedSlides);
      })
      .catch(err => {
        console.error("Error fetching banners:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeSlides = banners;

  const nextSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length === 0) return;
    const activeSlide = activeSlides[currentSlide];

    // Reset and pause all videos
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    if (activeSlide.type === "video") {
      // Play the active slide's video
      const activeVideo = videoRefs.current[currentSlide];
      if (activeVideo) {
        activeVideo.play().catch((err) => {
          console.log("Autoplay was prevented by browser:", err);
        });
      }
    } else {
      // Auto-advance for image slides after their configured duration
      const timer = setTimeout(() => {
        nextSlide();
      }, activeSlide.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, activeSlides, nextSlide]);

  if (loading) {
    return (
      <>
        <Offer />
        <section className="hero">
          <div className="hero-container d-flex align-items-center justify-content-center" style={{ minHeight: "50vh" }}>
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading banners...</span>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (activeSlides.length === 0) {
    return <Offer />;
  }

  return (
    <>
      <Offer />
      <section className="hero">
        <div className="hero-container">

          {/* Navigation Arrows */}
          <button className="slider-nav-btn prev" onClick={prevSlide} aria-label="Previous Slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button className="slider-nav-btn next" onClick={nextSlide} aria-label="Next Slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Slides Track */}
          <div
            className="hero-slide-wrapper"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {activeSlides.map((slide, index) => (
              <div
                className={`hero-slide ${slide.type === "video" ? "video-slide" : ""}`}
                key={index}
                style={{
                  backgroundColor: slide.background,
                  "--slide-text-color": slide.textColor,
                  "--slide-span-color": slide.spanColor,
                  "--slide-desc-color": slide.descColor,
                  "--slide-btn-bg": slide.btnBackground,
                  "--slide-btn-color": slide.btnTextColor,
                }}
              >
                <div className="hero-slide-container">
                  <div className="hero-content-left">
                    <span className="hero-tag">{slide.tag}</span>
                    <h1>{slide.title}</h1>
                    <p>{slide.description}</p>
                    <Link to={slide.link || "/products/watches"} className="shop-btn" style={{ textDecoration: "none" }}>
                      {slide.buttonText}
                    </Link>
                  </div>
                  <div className="hero-media-right">
                    {slide.type === "video" ? (
                      <video
                        ref={(el) => (videoRefs.current[index] = el)}
                        className="hero-video"
                        src={slide.video}
                        muted
                        playsInline
                        loop={false}
                        onEnded={nextSlide}
                      />
                    ) : (
                      <img src={slide.image} alt="Banner Product" className="hero-image" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicator Dots */}
          <div className="slider-dots">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                className={`slider-dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

export default Hero;
