// Home.jsx
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

  const images = [
    { src: roommate1, alt: "Roommates chilling in their apartment" },
    { src: roommate2, alt: "Roommates reading and hanging out" },
    { src: roommate3, alt: "Roommates having fun together" },
  ];

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-start">
          <p className="home-mark">Roomies</p>
          <div className="home-copy">
            <h1>Run your shared home without the chaos.</h1>
            <p className="home-subtitle">Manage chores, split bills, and keep house plans in one place.</p>
          </div>
          <div className="home-rule" />
          <p className="home-helper">Get started with your room.</p>
          <div className="cta-row">
            {user ? (
              <Link className="submit primary" to="/dashboard">Open dashboard</Link>
            ) : (
              <div className="submit-container">
                <Link className="submit primary" to="/signup">Create account</Link>
                <Link className="submit secondary secondary-action" to="/login">Log in</Link>
              </div>
            )}
          </div>
          {!user && <p className="home-login-note">Already have an account? <Link to="/login">Log in</Link></p>}
        </div>

        <div className="home-board">
          <div className="board-topline"><span>ROOMIES / 01</span><span>ROOM 3B</span></div>
          <div className="board-message">A better house starts with knowing what needs doing.</div>
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
          <div className="board-note">Who’s on dishes?</div>
          <div className="board-caption">Chores · receipts · plans</div>
        </div>

      </section>
    </main>
  );
}
