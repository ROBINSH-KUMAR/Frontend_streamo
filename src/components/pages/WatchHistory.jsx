import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchWatchHistory,
  clearWatchHistory,
  removeFromWatchHistory,
} from "../../redux/slices/historySlice";

import "./WatchHistory.css";

// ==========================================
// FORMAT DURATION
// ==========================================
function formatDuration(seconds) {
  if (!seconds) return "00:00";

  const totalSeconds = Number(seconds);

  if (Number.isNaN(totalSeconds)) {
    return "00:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      minutes,
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    secs,
  ).padStart(2, "0")}`;
}

// ==========================================
// FORMAT TIME
// ==========================================
function formatWatchedTime(date) {
  if (!date) return "";

  const now = new Date();
  const watchedDate = new Date(date);

  if (Number.isNaN(watchedDate.getTime())) {
    return "";
  }

  const difference = now - watchedDate;

  if (difference < 0) {
    return "Just now";
  }

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }

  if (months > 0) {
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }

  if (weeks > 0) {
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }

  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  if (minutes > 0) {
    return `${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  return "Just now";
}

// ==========================================
// HISTORY CARD
// ==========================================
function HistoryCard({
  video,
  onRemove,
  removing,
}) {
  return (
    <article className="history-card">

      {/* ================= REMOVE BUTTON ================= */}
      <button
        type="button"
        className="history-remove"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove(video._id);
        }}
        disabled={removing}
        title="Remove from watch history"
        aria-label="Remove from watch history"
      >
        {removing ? "…" : "×"}
      </button>

      {/* ================= VIDEO LINK ================= */}
      <Link
        to={`/watch/${video._id}`}
        className="history-card-link"
      >
        {/* ================= THUMBNAIL ================= */}
        <div className="history-thumbnail">

          <img
            src={video.thumbnail}
            alt={video.title || "Video"}
            loading="lazy"
          />

          <div className="history-gradient" />

          <div className="history-play">
            <span>▶</span>
          </div>

          <span className="history-duration">
            {formatDuration(video.duration)}
          </span>

          <div className="history-title">
            {video.title || "Untitled video"}
          </div>

        </div>

        {/* ================= INFO ================= */}
        <div className="history-info">

          {/* AVATAR */}
          <div className="history-avatar">
            {video.owner?.avatar ? (
              <img
                src={video.owner.avatar}
                alt={
                  video.owner?.fullName ||
                  video.owner?.userName ||
                  "Creator"
                }
              />
            ) : (
              <div className="history-avatar-fallback">
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

          {/* DETAILS */}
          <div className="history-details">

            <h3>
              {video.description ||
                video.title ||
                "Untitled video"}
            </h3>

            <span>
              {video.owner?.fullName ||
                video.owner?.userName ||
                "Unknown creator"}
            </span>

            {video.watchedAt && (
              <small>
                Watched{" "}
                {formatWatchedTime(video.watchedAt)}
              </small>
            )}

          </div>
        </div>
      </Link>
    </article>
  );
}

// ==========================================
// WATCH HISTORY PAGE
// ==========================================
function WatchHistory() {
  const dispatch = useDispatch();

  const {
    history: videos,
    loading,
    error,
  } = useSelector((state) => state.history);

  // ========================================
  // UI STATES
  // ========================================
  const [showClearModal, setShowClearModal] =
    useState(false);

  const [removingId, setRemovingId] =
    useState(null);

  const [clearing, setClearing] =
    useState(false);

  // ========================================
  // FETCH HISTORY
  // ========================================
  useEffect(() => {
    dispatch(fetchWatchHistory());
  }, [dispatch]);

  // ========================================
  // REMOVE SINGLE VIDEO
  // ========================================
  const handleRemoveVideo = async (videoId) => {
    if (!videoId) return;

    try {
      setRemovingId(videoId);

      await dispatch(
        removeFromWatchHistory(videoId),
      ).unwrap();
    } catch (error) {
      console.error(
        "Failed to remove video from history:",
        error,
      );
    } finally {
      setRemovingId(null);
    }
  };

  // ========================================
  // CLEAR ENTIRE HISTORY
  // ========================================
  const handleClearHistory = async () => {
    try {
      setClearing(true);

      await dispatch(
        clearWatchHistory(),
      ).unwrap();

      setShowClearModal(false);
    } catch (error) {
      console.error(
        "Failed to clear watch history:",
        error,
      );
    } finally {
      setClearing(false);
    }
  };

  // ========================================
  // NORMALIZE DATA
  // ========================================
  const historyVideos = Array.isArray(videos)
    ? videos
    : [];

  return (
    <div className="history-page">

      <main className="history-content">

        {/* ==================================
            HEADER
        ================================== */}
        <div className="history-header">

          <div>
            <span className="history-label">
              YOUR ACTIVITY
            </span>

            <h1>Watch history</h1>

            <p>
              Videos you've recently watched.
            </p>
          </div>

          {historyVideos.length > 0 && (
            <button
              type="button"
              className="clear-history"
              onClick={() =>
                setShowClearModal(true)
              }
              disabled={clearing}
            >
              Clear history
            </button>
          )}

        </div>

        {/* ==================================
            LOADING
        ================================== */}
        {loading && (
          <div className="history-loading">

            <div className="history-spinner"></div>

            <p>
              Loading your watch history...
            </p>

          </div>
        )}

        {/* ==================================
            ERROR
        ================================== */}
        {!loading && error && (
          <div className="history-error">

            <div className="empty-icon">
              !
            </div>

            <h2>
              Couldn't load watch history
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                dispatch(fetchWatchHistory())
              }
            >
              Try again
            </button>

          </div>
        )}

        {/* ==================================
            VIDEOS
        ================================== */}
        {!loading &&
          !error &&
          historyVideos.length > 0 && (
            <section className="history-section">

              <div className="history-grid">

                {historyVideos.map((video) => (
                  <HistoryCard
                    key={video._id}
                    video={video}
                    onRemove={handleRemoveVideo}
                    removing={
                      removingId === video._id
                    }
                  />
                ))}

              </div>

            </section>
          )}

        {/* ==================================
            EMPTY
        ================================== */}
        {!loading &&
          !error &&
          historyVideos.length === 0 && (
            <div className="history-empty">

              <div className="empty-icon">
                ◷
              </div>

              <h2>
                No watch history
              </h2>

              <p>
                Videos you watch will appear here.
              </p>

              <Link to="/">
                Browse videos
              </Link>

            </div>
          )}

      </main>

      {/* ======================================
          CLEAR HISTORY MODAL
      ====================================== */}
      {showClearModal && (
        <div
          className="history-modal-overlay"
          onClick={() =>
            !clearing &&
            setShowClearModal(false)
          }
        >
          <div
            className="history-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="history-modal-icon">
              !
            </div>

            <h2>
              Clear watch history?
            </h2>

            <p>
              This will remove all videos from
              your watch history. This action
              cannot be undone.
            </p>

            <div className="history-modal-actions">

              <button
                type="button"
                className="history-modal-cancel"
                onClick={() =>
                  setShowClearModal(false)
                }
                disabled={clearing}
              >
                Cancel
              </button>

              <button
                type="button"
                className="history-modal-confirm"
                onClick={handleClearHistory}
                disabled={clearing}
              >
                {clearing
                  ? "Clearing..."
                  : "Clear history"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default WatchHistory;