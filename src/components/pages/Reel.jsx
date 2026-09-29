
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import "./Reel.css";

import {
  fetchVideos,
  likeVideo,
  unlikeVideo,
} from "../../redux/slices/videoSlice";

function Reel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    videos,
    loading,
    error,
  } = useSelector((state) => state.videos);

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRefs = useRef([]);

  // ==============================
  // FETCH VIDEOS
  // Same /videos API used by
  // VideoCard
  // ==============================
  useEffect(() => {
    if (!videos || videos.length === 0) {
      dispatch(fetchVideos());
    }
  }, [dispatch, videos]);

  // ==============================
  // ACTIVE VIDEO
  // ==============================
  const activeVideo = videos?.[activeIndex];

  // ==============================
  // PLAY ACTIVE VIDEO
  // ==============================
  useEffect(() => {
    const video = videoRefs.current[activeIndex];

    if (!video) return;

    video.currentTime = 0;
    video.muted = muted;

    video.play().catch(() => {});
  }, [activeIndex, muted]);

  // ==============================
  // PAUSE INACTIVE VIDEOS
  // ==============================
  useEffect(() => {
    videoRefs.current.forEach(
      (video, index) => {
        if (!video) return;

        if (index !== activeIndex) {
          video.pause();
        }
      }
    );
  }, [activeIndex]);

  // ==============================
  // KEYBOARD NAVIGATION
  // ==============================
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowDown") {
        goNext();
      }

      if (event.key === "ArrowUp") {
        goPrevious();
      }

      if (event.key === " ") {
        event.preventDefault();

        const video =
          videoRefs.current[activeIndex];

        if (!video) return;

        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [activeIndex, videos?.length]);

  // ==============================
  // NEXT REEL
  // ==============================
  const goNext = () => {
    if (
      activeIndex <
      videos.length - 1
    ) {
      setActiveIndex(
        (prev) => prev + 1
      );

      setProgress(0);
    }
  };

  // ==============================
  // PREVIOUS REEL
  // ==============================
  const goPrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(
        (prev) => prev - 1
      );

      setProgress(0);
    }
  };

  // ==============================
  // LIKE / UNLIKE
  // ==============================
  const handleLike = (video) => {
    if (!video?._id) return;

    if (video.isLiked) {
      dispatch(
        unlikeVideo(video._id)
      );
    } else {
      dispatch(
        likeVideo(video._id)
      );
    }
  };

  // ==============================
  // VIDEO PROGRESS
  // ==============================
  const handleTimeUpdate = (
    event
  ) => {
    const video =
      event.currentTarget;

    if (!video.duration) return;

    setProgress(
      (video.currentTime /
        video.duration) *
        100
    );
  };

  // ==============================
  // VIDEO ENDED
  // ==============================
  const handleVideoEnded = () => {
    goNext();
  };

  // ==============================
  // MUTE
  // ==============================
  const toggleMute = () => {
    setMuted(
      (prev) => !prev
    );
  };

  // ==============================
  // CLICK VIDEO
  // ==============================
  const handleVideoClick = (
    event
  ) => {
    const video =
      event.currentTarget;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  // ==============================
  // OPEN CHANNEL
  // ==============================
  const openChannel = (
    username
  ) => {
    if (!username) return;

    navigate(
      `/channel/${username}`
    );
  };

  // ==============================
  // OPEN FULL VIDEO
  // ==============================
  const openVideo = (
    videoId
  ) => {
    if (!videoId) return;

    navigate(
      `/watch/${videoId}`
    );
  };

  // ==============================
  // LOADING
  // ==============================
  if (
    loading &&
    !videos?.length
  ) {
    return (
      <div className="reel-page">
        <div className="reel-loading">
          <div className="reel-spinner"></div>

          <p>
            Loading reels...
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================
  if (
    error &&
    !videos?.length
  ) {
    return (
      <div className="reel-page">
        <div className="reel-empty">

          <div className="reel-empty-icon">
            !
          </div>

          <h2>
            Unable to load videos
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={() =>
              dispatch(fetchVideos())
            }
          >
            Try again
          </button>

        </div>
      </div>
    );
  }

  // ==============================
  // NO VIDEOS
  // ==============================
  if (!videos?.length) {
    return (
      <div className="reel-page">
        <div className="reel-empty">

          <div className="reel-empty-icon">
            ▶
          </div>

          <h2>
            No videos available
          </h2>

          <p>
            There are no videos available
            to watch right now.
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
          >
            Back to Home
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="reel-page">

      {/* ==========================
          BACK BUTTON
      ========================== */}

      <button
        className="reel-back"
        onClick={() =>
          navigate(-1)
        }
      >
        <span>←</span>
        Back
      </button>

      {/* ==========================
          COUNTER
      ========================== */}

      <div className="reel-counter">
        {activeIndex + 1} /{" "}
        {videos.length}
      </div>

      {/* ==========================
          REEL VIEWER
      ========================== */}

      <div className="reel-viewer">

        {videos.map(
          (video, index) => {

            const owner =
              video.owner || {};

            const username =
              owner.userName ||
              owner.username ||
              "Unknown";

            const fullName =
              owner.fullName ||
              username;

            const avatar =
              owner.avatar ||
              "/default-avatar.png";

            return (
              <div
                key={
                  video._id ||
                  index
                }
                className={`reel-item ${
                  index === activeIndex
                    ? "reel-item-active"
                    : ""
                }`}
              >

                {/* ==================
                    VIDEO
                ================== */}

                <video
                  ref={(element) => {
                    videoRefs.current[
                      index
                    ] = element;
                  }}
                  className="reel-video"
                  src={video.videoFile}
                  playsInline
                  loop={false}
                  muted={muted}
                  preload={
                    index === activeIndex
                      ? "auto"
                      : "metadata"
                  }
                  onClick={
                    handleVideoClick
                  }
                  onTimeUpdate={
                    index === activeIndex
                      ? handleTimeUpdate
                      : undefined
                  }
                  onEnded={
                    index === activeIndex
                      ? handleVideoEnded
                      : undefined
                  }
                />

                {/* ==================
                    GRADIENT
                ================== */}

                <div className="reel-gradient"></div>

                {/* ==================
                    TOP
                ================== */}

                {index ===
                  activeIndex && (
                  <div className="reel-top">

                    <div className="reel-top-title">
                      Reels
                    </div>

                    <button
                      className="reel-mute"
                      onClick={
                        toggleMute
                      }
                      title={
                        muted
                          ? "Unmute"
                          : "Mute"
                      }
                    >
                      {muted
                        ? "🔇"
                        : "🔊"}
                    </button>

                  </div>
                )}

                {/* ==================
                    ACTIONS
                ================== */}

                {index ===
                  activeIndex && (
                  <div className="reel-actions">

                    {/* LIKE */}

                    <button
                      className={`reel-action ${
                        video.isLiked
                          ? "reel-liked"
                          : ""
                      }`}
                      onClick={() =>
                        handleLike(
                          video
                        )
                      }
                    >

                      <span className="reel-action-icon">
                        {video.isLiked
                          ? "♥"
                          : "♡"}
                      </span>

                      <span>
                        {video.likes ||
                          0}
                      </span>

                    </button>

                    {/* COMMENT */}

                    <button
                      className="reel-action"
                      onClick={() =>
                        openVideo(
                          video._id
                        )
                      }
                    >

                      <span className="reel-action-icon">
                        ♡
                      </span>

                      <span>
                        Comment
                      </span>

                    </button>

                    {/* SHARE */}

                    <button
                      className="reel-action"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/watch/${video._id}`
                          );

                          alert(
                            "Video link copied!"
                          );
                        } catch (
                          error
                        ) {
                          console.error(
                            "Share failed:",
                            error
                          );
                        }
                      }}
                    >

                      <span className="reel-action-icon">
                        ↗
                      </span>

                      <span>
                        Share
                      </span>

                    </button>

                  </div>
                )}

                {/* ==================
                    VIDEO INFO
                ================== */}

                {index ===
                  activeIndex && (
                  <div className="reel-info">

                    {/* CHANNEL */}

                    <div
                      className="reel-channel"
                      onClick={() =>
                        openChannel(
                          username
                        )
                      }
                    >

                      <img
                        src={avatar}
                        alt={username}
                        className="reel-avatar"
                      />

                      <div className="reel-channel-text">

                        <strong>
                          @{username}
                        </strong>

                        <span>
                          {fullName}
                        </span>

                      </div>

                      <button
                        className="reel-follow"
                        onClick={(
                          event
                        ) =>
                          event.stopPropagation()
                        }
                      >
                        Follow
                      </button>

                    </div>

                    {/* TITLE */}

                    <h2
                      className="reel-title"
                      onClick={() =>
                        openVideo(
                          video._id
                        )
                      }
                    >
                      {video.title}
                    </h2>

                    {/* DESCRIPTION */}

                    {video.description && (
                      <p className="reel-description">
                        {
                          video.description
                        }
                      </p>
                    )}

                    {/* META */}

                    <div className="reel-meta">

                      <span>
                        {(
                          video.views ||
                          0
                        ).toLocaleString()}{" "}
                        views
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        Watch full video →
                      </span>

                    </div>

                  </div>
                )}

                {/* ==================
                    PROGRESS
                ================== */}

                {index ===
                  activeIndex && (
                  <div className="reel-progress">

                    <div
                      className="reel-progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>
                )}

              </div>
            );
          }
        )}

        {/* ==========================
            NAVIGATION
        ========================== */}

        <div className="reel-navigation">

          <button
            className="reel-nav-button"
            onClick={
              goPrevious
            }
            disabled={
              activeIndex === 0
            }
          >
            ↑
          </button>

          <button
            className="reel-nav-button"
            onClick={
              goNext
            }
            disabled={
              activeIndex ===
              videos.length - 1
            }
          >
            ↓
          </button>

        </div>

      </div>

      {/* ==========================
          HINT
      ========================== */}

      <div className="reel-hint">

        <span>↑</span>

        <span>
          Scroll to explore
        </span>

        <span>↓</span>

      </div>

    </div>
  );
}

export default Reel;
