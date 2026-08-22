// src/components/Banner.jsx
import React from "react";
import { Tickets, Info, Star } from "lucide-react";
import Video from "../../assets/MovieBannerVideo.mp4";
import { bannerStyles } from "../../assets/dummyStyles";

const Banner = () => {
  return (
    <div className={bannerStyles.container}>
      {/* Video background (covers all sizes) */}
      <div className={bannerStyles.videoContainer}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={bannerStyles.video}
        >
          <source src={Video} type="video/mp4" />
          {/* fallback text */}
          Your browser does not support the video tag.
        </video>

        {/* subtle overlay to keep text legible on smaller screens */}
        <div
          aria-hidden="true"
          className={bannerStyles.overlay}
        />
      </div>

      {/* Content */}
      <div className={bannerStyles.content}>
        <div className={bannerStyles.contentInner}>
          {/* Title with dancing font */}
          <h1
            className={bannerStyles.title}
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Ocean's Legacy
          </h1>

          {/* Description */}
          <p className={bannerStyles.description}>
            An epic adventure beneath the waves. Explore the mysteries of the deep ocean and discover treasures
            beyond imagination in this breathtaking cinematic experience.
          </p>

          {/* Rating and genre */}
          <div className={bannerStyles.ratingGenreContainer}>
            <div className={bannerStyles.ratingContainer}>
              <div className={bannerStyles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={bannerStyles.star}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className={bannerStyles.ratingText}>4.8/5</span>
            </div>

            <div className={bannerStyles.genreText}>Adventure • Fantasy • Drama</div>
          </div>

          {/* Action buttons */}
          <div className={bannerStyles.buttonsContainer}>
            <a
              href="/movies"
              className={bannerStyles.bookButton}
            >
              <Tickets className={bannerStyles.icon} fill="white" />
              Book Movies
            </a>

            <a
              href="/contact"
              className={bannerStyles.infoButton}
            >
              <Info className={bannerStyles.icon} />
              More Info
            </a>
          </div>
        </div>
      </div>

      {/* Custom fonts & small style tweaks */}
      <style>
        {bannerStyles.customCSS}
      </style>
    </div>
  );
};

export default Banner;