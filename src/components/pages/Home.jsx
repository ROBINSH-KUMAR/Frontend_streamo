
import React, { useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchVideos } from "../../redux/slices/videoSlice";

import "./Home.css";

/* =========================================================
   ICONS
========================================================= */

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-7h6v7" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M10 21h4" />
  </svg>
);

const SeriesIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m10 9 5 3-5 3V9Z" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A5 5 0 0 1 12 6a5 5 0 0 1 8.8 2.7Z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c.7-4.2 3.3-6 8-6s7.3 1.8 8 6" />
  </svg>
);

const PlayIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="play-icon"
    aria-hidden="true"
  >
    <path d="m9 6 9 6-9 6V6Z" />
  </svg>
);

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar() {
  const user = useSelector((state) => state.auth.user);

  const navigation = [
    {
      label: "Home",
      path: "/",
      icon: <HomeIcon />,
    },
    {
      label: "Search",
      path: "/search",
      icon: <SearchIcon />,
    },
    {
      label: "PVi",
      path: "/publish-video",
      icon: <BellIcon />,
    },
    {
      label: "Reel",
      path: "/reel",
      icon: <SeriesIcon />,
    },
    {
      label: "watch-history",
      path: "/watch-history",
      icon: <SeriesIcon />,
    },
    {
      label: "My favourites",
      path: "/favorites",
      icon: <HeartIcon />,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: <UserIcon />,
    },
  ];

  return (<></>
    // <aside className="sidebar">
    //   {/* BRAND */}

    //   <Link to="/" className="brand">
    //     <div className="brand-icon">
    //       <div className="brand-screen">
    //         <span />
    //       </div>
    //     </div>

    //     <span className="brand-name">Streamo</span>
    //   </Link>

    //   {/* NAVIGATION */}

    //   <nav className="sidebar-nav">
    //     {navigation.map((item) => (
    //       <NavLink
    //         key={item.path}
    //         to={item.path}
    //         end={item.path === "/"}
    //         className={({ isActive }) =>
    //           `nav-item ${isActive ? "active" : ""}`
    //         }
    //       >
    //         <span className="nav-icon">
    //           {item.icon}
    //         </span>

    //         <span className="nav-label">
    //           {item.label}
    //         </span>
    //       </NavLink>
    //     ))}
    //   </nav>

    //   {/* PROFILE */}

    //   <Link to="/profile" className="sidebar-profile">
    //     <div className="profile-avatar-wrapper">
    //       {user?.avatar ? (
    //         <img
    //           src={user.avatar}
    //           alt={
    //             user.fullName ||
    //             user.userName ||
    //             "Profile"
    //           }
    //         />
    //       ) : (
    //         <div className="sidebar-avatar-fallback">
    //           {(
    //             user?.fullName ||
    //             user?.userName ||
    //             "U"
    //           )
    //             .charAt(0)
    //             .toUpperCase()}
    //         </div>
    //       )}

    //       <span className="online-dot" />
    //     </div>
    //   </Link>
    // </aside>
  );
}

/* =========================================================
   RATING
========================================================= */

function Rating({ value, small = false }) {
  return (
    <div
      className={`rating ${
        small ? "rating-small" : ""
      }`}
    >
      <span>{value}</span>
    </div>
  );
}

/* =========================================================
   FEATURED HERO
========================================================= */

function FeaturedHero({ video }) {
  if (!video) return null;

  return (
    <Link
      to={`/watch/${video._id}`}
      className="featured-hero-link"
      aria-label={`Watch ${video.title}`}
    >
      <section
        className="featured-hero"
        style={{
          backgroundImage: `url(${video.thumbnail})`,
        }}
      >
        <div className="hero-overlay" />

        <div className="hero-rating">
          <Rating
            value={video.rating || "8.6"}
          />
        </div>

        <div className="hero-content">
          <h1>{video.title}</h1>

          {video.description && (
            <p>{video.description}</p>
          )}

          <div className="hero-tags">
            <span>SCI-FI</span>
            <span>DRAMA</span>
            <span>ADVENTURE</span>
          </div>
        </div>
      </section>
    </Link>
  );
}

/* =========================================================
   SMALL FEATURED CARD
========================================================= */

function FeaturedCard({
  video,
  rating,
  year,
  genre,
}) {
  if (!video) return null;

  return (
    <Link
      to={`/watch/${video._id}`}
      className="featured-card-link"
      aria-label={`Watch ${video.title}`}
    >
      <article
        className="featured-card"
        style={{
          backgroundImage: `url(${video.thumbnail})`,
        }}
      >
        <div className="featured-card-overlay" />

        <div className="featured-rating">
          <Rating
            value={
              video.rating || rating
            }
            small
          />
        </div>

        <div className="featured-card-content">
          <h2>{video.title}</h2>

          <span className="featured-meta">
            {year || "2025"},{" "}
            {genre || "Adventure"}
          </span>
        </div>
      </article>
    </Link>
  );
}

/* =========================================================
   VIDEO THUMBNAIL CARD
========================================================= */

function VideoThumbnailCard({ video }) {
  const navigate = useNavigate();

  const year = video.createdAt
    ? new Date(video.createdAt).getFullYear()
    : "";

  /*
   * Open creator's channel.
   *
   * Important:
   * We prevent the parent video Link from opening.
   */
  const handleChannelClick = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const ownerId = video.owner?._id;

  if (!ownerId) {
    console.error("Owner ID is missing");
    return;
  }

  navigate(`/channel/${ownerId}`);
};
  return (
    <Link
      to={`/watch/${video._id}`}
      className="video-card-link"
      aria-label={`Watch ${video.title}`}
    >
      <article className="video-card">

        {/* =================================================
            THUMBNAIL
        ================================================= */}

        <div className="video-thumbnail">
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
          />

          <div className="thumbnail-gradient" />

          <div className="thumbnail-overlay">
            <div className="play-button">
              <PlayIcon />
            </div>
          </div>

          <span className="video-duration">
            {formatDuration(video.duration)}
          </span>

          <div className="thumbnail-content">
            <h3>{video.title}</h3>

            {year && (
              <span className="thumbnail-year">
                {year}
              </span>
            )}
          </div>
        </div>

        {/* =================================================
            VIDEO INFORMATION
        ================================================= */}

        <div className="video-info">

          {/* =================================================
              OWNER AVATAR

              Clicking this goes to:

              /channel/:username

              instead of:

              /watch/:videoId
          ================================================= */}

          <div
            className="video-owner-avatar"
            onClick={handleChannelClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                handleChannelClick(event);
              }
            }}
            aria-label={`Open ${
              video.owner?.userName ||
              "creator"
            } channel`}
          >
            {video.owner?.avatar ? (
              <img
                src={video.owner.avatar}
                alt={
                  video.owner?.fullName ||
                  video.owner?.userName ||
                  "Channel"
                }
                loading="lazy"
              />
            ) : (
              <div className="avatar-fallback">
                {(
                  video.owner?.fullName ||
                  video.owner?.userName ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* =================================================
              DESCRIPTION + CHANNEL
          ================================================= */}

          <div className="video-details">
            <p className="video-description">
              {video.description ||
                "No description"}
            </p>

            <span
              className="video-channel"
              onClick={handleChannelClick}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  handleChannelClick(event);
                }
              }}
            >
              {video.owner?.fullName ||
                video.owner?.userName ||
                "Unknown channel"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatDuration(seconds) {
  if (
    !seconds ||
    Number.isNaN(Number(seconds))
  ) {
    return "00:00";
  }

  const totalSeconds = Number(seconds);

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const mins = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const secs = Math.floor(
    totalSeconds % 60
  );

  if (hours > 0) {
    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  return `${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

/* =========================================================
   HOME PAGE
========================================================= */

export default function Home() {
  const dispatch = useDispatch();

  const {
    videos,
    loading,
    error,
  } = useSelector(
    (state) => state.videos
  );

  /*
   * Fetch videos when Home loads.
   */
  useEffect(() => {
    dispatch(fetchVideos());
  }, [dispatch]);

  /*
   * Make sure videos is always an array.
   */
  const videoList = Array.isArray(videos)
    ? videos
    : [];

  /* -------------------------------------------------------
     FEATURED CONTENT
  ------------------------------------------------------- */

  const heroVideo = videoList[0];

  const sideVideoOne =
    videoList[1];

  const sideVideoTwo =
    videoList[2];

  /* -------------------------------------------------------
     CONTINUE WATCHING
  ------------------------------------------------------- */

  const continueWatching =
    videoList.slice(3);

  return (
    <div className="home-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="home-content">

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="home-empty">
            <h2>Loading videos...</h2>

            <p>
              Please wait while we load
              your videos.
            </p>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && !loading && (
          <div className="home-empty">
            <h2>
              Unable to load videos
            </h2>

            <p>{error}</p>
          </div>
        )}

        {/* =================================================
            FEATURED AREA
        ================================================= */}

        {!loading &&
          !error &&
          heroVideo && (
            <section className="hero-grid">

              {/* BIG HERO */}

              <FeaturedHero
                video={heroVideo}
              />

              {/* RIGHT FEATURED CARDS */}

              <div className="featured-side">

                <FeaturedCard
                  video={sideVideoOne}
                  rating="7.0"
                  year="2013"
                  genre="Sci-fi, Action"
                />

                <FeaturedCard
                  video={sideVideoTwo}
                  rating="8.2"
                  year="2015"
                  genre="Adventure"
                />

              </div>
            </section>
          )}

        {/* =================================================
            CONTINUE WATCHING
        ================================================= */}

        {!loading &&
          !error &&
          continueWatching.length > 0 && (
            <section className="content-section">

              <div className="section-heading">
                <h2>
                  Continue watching
                </h2>
              </div>

              <div className="video-grid">

                {continueWatching.map(
                  (video) => (
                    <VideoThumbnailCard
                      key={video._id}
                      video={video}
                    />
                  )
                )}

              </div>
            </section>
          )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          !error &&
          !heroVideo && (
            <div className="home-empty">
              <h2>
                No videos available
              </h2>

              <p>
                Videos will appear here
                once they are available.
              </p>
            </div>
          )}

      </main>
    </div>
  );
}
