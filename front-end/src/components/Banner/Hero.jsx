import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";
import Banner from "../../assets/images/banner2.png";
import BannerVideo from "../../assets/Video/banner_video.mp4";
import Offer from "./Offer";

const slides = [
  {
    type: "video",
    video: BannerVideo,
    link: "/products/watches",
    background: "#0c0c0c",
  },
  {
    type: "image",
    tag: "TRENDING TECH",
    title: (
      <>
        UPGRADE YOUR STYLE
        <br />
        <span>SHOP THE LATEST</span>
      </>
    ),
    description: "Discover premium watches, smart accessories and everyday essentials designed for your lifestyle.",
    buttonText: "Shop Now →",
    image: Banner,
    link: "/products/watches",
    background: "#f5f5f7",
    duration: 5000,
    textColor: "#000000",
    spanColor: "#FDB101",
    descColor: "#555555",
    btnBackground: "#000000",
    btnTextColor: "#ffffff",
  },
  {
    type: "image",
    tag: "EXCLUSIVE OFFER",
    title: (
      <>
        PREMIUM TECH.
        <br />
        <span>BETTER LIFESTYLE.</span>
      </>
    ),
    description: "Shop premium watches, earbuds, shoes and everyday accessories at great prices.",
    buttonText: "Explore Deals →",
    image: Banner,
    link: "/products/deals",
    background: "#FDB101",
    duration: 5000,
    textColor: "#000000",
    spanColor: "#ffffff",
    descColor: "#1a1a1a",
    btnBackground: "#000000",
    btnTextColor: "#ffffff",
  },
  {
    type: "image",
    tag: "DISCOVER MORE",
    title: (
      <>
        PRODUCTS YOU'LL LOVE
        <br />
        <span>BEST QUALITY</span>
      </>
    ),
    description: "Upgrade your routine with our top trending tech accessories and everyday gear.",
    buttonText: "Explore Now →",
    image: Banner,
    link: "/products/accessories",
    background: "#111111",
    duration: 5000,
    textColor: "#ffffff",
    spanColor: "#FDB101",
    descColor: "#e2e8f0",
    btnBackground: "#ffffff",
    btnTextColor: "#0c0c0c",
  },
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef([]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const activeSlide = slides[currentSlide];

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
  }, [currentSlide]);

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
            {slides.map((slide, index) => (
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
                  {/* Left text content rendered only for non-video slides */}
                  {slide.type !== "video" && (
                    <div className="hero-content-left">
                      {slide.tag && <span className="hero-tag">{slide.tag}</span>}
                      {slide.title && <h1>{slide.title}</h1>}
                      {slide.description && <p>{slide.description}</p>}
                      {slide.buttonText && (
                        <Link to={slide.link || "/products/watches"} className="shop-btn" style={{ textDecoration: "none" }}>
                          {slide.buttonText}
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Media container */}
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
            {slides.map((_, index) => (
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