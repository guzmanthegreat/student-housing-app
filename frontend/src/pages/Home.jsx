// Home.jsx
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import "./Home.css";

import fetchImg from "../assets/fetch.png";
import motivImg from "../assets/motivation.png";
import snoopyImg from "../assets/snoopy.png";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("session") || "null");

  const quotes = useMemo(
    () => [
      "Teamwork makes the dream work!",
      "Clean space, clear mind",
      "Little chores, big vibes.",
      "A tidy home is a happy home.",
    ],
    []
  );
  const quote = quotes[new Date().getDate() % quotes.length];

  // Put your images in /public/images/
  const images = [
    { src: fetchImg, alt: "Fetch image" },
    { src: motivImg, alt: "motivation image" },
    { src: snoopyImg, alt: "snoopy image" },
  ];

  return (
    <main className="home-page">
      <section className="home-hero">
        <h1>Come Sit With Us!</h1>

        <div className="carousel-swiper">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <img className="slide-img" src={img.src} alt={img.alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="cta-row">
          {user ? (
            <div></div>
          ) : (
            <div className="submit-container">
              <Link className="submit secondary" to="/signup">
                Join The Plastics!
              </Link>
              <Link className="submit primary" to="/login">
                Get In Loser!
              </Link>
            </div>
          )}
        </div>

        <div className="quote">
          <span className="tape" />
          <em>“{quote}”</em>
        </div>
      </section>
    </main>
  );
}
