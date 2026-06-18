// Home.jsx
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import "./Home.css";

import roommate1 from "../assets/roommate1.jpg";
import roommate2 from "../assets/roommate2.jpg";
import roommate3 from "../assets/roommate3.jpg";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("session") || "null");

  const quotes = useMemo(
    () => [
      "Home is whoever you share it with.",
      "Clean space, clear mind",
      "Your home, your rules, your people.",
      "A tidy home is a happy home.",
    ],
    []
  );
  const quote = quotes[new Date().getDate() % quotes.length];

  const images = [
    { src: roommate1, alt: "Roommates chilling in their apartment" },
    { src: roommate2, alt: "Roommates reading and hanging out" },
    { src: roommate3, alt: "Roommates having fun together" },
];

  return (
    <main className="home-page">
      <section className="home-hero">
        <h1>Join Roomies Today!</h1>

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
                Sign up
              </Link>
              <Link className="submit primary" to="/login">
                Login
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
