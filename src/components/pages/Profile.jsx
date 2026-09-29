import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import api from "../../api/axios";

import {
  fetchChannelSubscribers,
  fetchChannelSubscriptions,
} from "../../redux/slices/subscriptionSlice";

import {
  deleteVideo,
  togglePublishStatus,
} from "../../redux/slices/videoSlice";

import "./Profile.css";

/* =========================================================
   HELPERS
========================================================= */

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(Number(seconds))) {
    return "00:00";
  }

  const totalSeconds = Number(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      mins
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

function formatViews(views) {
  const count = Number(views) || 0;

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return count.toString();
}

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* =========================================================
   PLAY ICON
========================================================= */

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="profile-play-icon"
      aria-hidden="true"
    >
      <path d="m9 6 9 6-9 6V6Z" />
    </svg>
  );
}

/* =========================================================
   THREE DOTS ICON
========================================================= */

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="profile-more-icon"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="19" r="1.7" />
    </svg>
  );
}

/* =========================================================
   PUBLISH ICON
========================================================= */

function PublishIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="profile-menu-icon"
      aria-hidden="true"
    >
      <path d="M12 3 5 10h4v6h6v-6h4l-7-7Zm-7 15v3h14v-3H5Z" />
    </svg>
  );
}

/* =========================================================
   DELETE ICON
========================================================= */

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="profile-menu-icon profile-delete-icon"
      aria-hidden="true"
    >
      <path d="M6 7h12l-1 13H7L6 7Zm3-4h6l1 2H8l1-2Zm-4 4h14v2H5V7Z" />
    </svg>
  );
}

/* =========================================================
   VIDEO CARD
========================================================= */

function ProfileVideoCard({
  video,
  onDelete,
  onTogglePublish,
}) {
  const year = video.createdAt
    ? new Date(video.createdAt).getFullYear()
    : "";

  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen((previous) => !previous);
  };

  const handleTogglePublish = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen(false);
    onTogglePublish(video._id);
  };

  const handleDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen(false);
    onDelete(video._id);
  };

  return (
    <Link
      to={`/watch/${video._id}`}
      className="profile-video-card-link"
      aria-label={`Watch ${video.title}`}
      onClick={() => setMenuOpen(false)}
    >
      <article className="profile-video-card">

        {/* THUMBNAIL */}

        <div className="profile-video-thumbnail">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              loading="lazy"
            />
          ) : (
            <div className="profile-thumbnail-fallback">
              No thumbnail
            </div>
          )}

          <div className="profile-thumbnail-gradient" />

          <div className="profile-thumbnail-overlay">
            <div className="profile-play-button">
              <PlayIcon />
            </div>
          </div>

          <span className="profile-video-duration">
            {formatDuration(video.duration)}
          </span>

          {/* =================================================
              PUBLISH STATUS
          ================================================= */}

          <span
            className={`profile-publish-status ${
              video.isPublished
                ? "profile-published"
                : "profile-unpublished"
            }`}
          >
            {video.isPublished
              ? "Published"
              : "Private"}
          </span>

          {/* =================================================
              THREE DOT MENU
          ================================================= */}

          <div className="profile-video-menu-wrapper">
            <button
              type="button"
              className="profile-video-menu-button"
              onClick={handleMenuClick}
              aria-label="Video options"
              aria-expanded={menuOpen}
            >
              <MoreIcon />
            </button>

            {menuOpen && (
              <div
                className="profile-video-menu"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  type="button"
                  className="profile-video-menu-item"
                  onClick={handleTogglePublish}
                >
                  <PublishIcon />

                  <span>
                    {video.isPublished
                      ? "Make private"
                      : "Publish video"}
                  </span>
                </button>

                <button
                  type="button"
                  className="profile-video-menu-item profile-video-menu-delete"
                  onClick={handleDelete}
                >
                  <DeleteIcon />

                  <span>
                    Delete video
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="profile-thumbnail-content">
            <h3>{video.title}</h3>

            {year && (
              <span className="profile-thumbnail-year">
                {year}
              </span>
            )}
          </div>
        </div>

        {/* VIDEO INFORMATION */}

        <div className="profile-video-info">
          <div className="profile-video-details">

            <p className="profile-video-description">
              {video.description || "No description"}
            </p>

            <div className="profile-video-meta">
              <span>
                {formatViews(video.views)} views
              </span>

              <span>•</span>

              <span>
                {formatDate(video.createdAt)}
              </span>
            </div>

          </div>
        </div>

      </article>
    </Link>
  );
}

/* =========================================================
   USER / CHANNEL LIST ITEM
========================================================= */

function ChannelUserItem({ user, onClick }) {
  if (!user) return null;

  const userId = user._id;

  return (
    <button
      type="button"
      className="profile-channel-user"
      onClick={() => onClick(userId)}
    >
      <div className="profile-channel-user-avatar">

        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName || user.userName || "User"}
          />
        ) : (
          <div className="profile-channel-user-avatar-fallback">
            {(user.fullName || user.userName || "U")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

      </div>

      <div className="profile-channel-user-info">
        <strong>
          {user.fullName || user.userName || "Unknown user"}
        </strong>

        {user.userName && (
          <span>@{user.userName}</span>
        )}
      </div>

      <span className="profile-channel-user-arrow">
        ›
      </span>
    </button>
  );
}

/* =========================================================
   PROFILE PAGE
========================================================= */

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     MODAL
  ======================================================= */

  const [activeList, setActiveList] = useState(null);
  const [notification, setNotification] = useState(null);
  const [deleteVideoId, setDeleteVideoId] = useState(null);

  /* =======================================================
     REDUX
  ======================================================= */

  const {
    channelSubscribers = [],
    channelSubscriptions = [],
    loading: subscriptionLoading = false,
    error: subscriptionError = null,
  } = useSelector(
    (state) => state.subscription || {}
  );

  /* =======================================================
     CURRENT USER
  ======================================================= */

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/current-user");

        const currentUser =
          response.data?.data || null;

        setUser(currentUser);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  /* =======================================================
     FETCH SUBSCRIBERS + SUBSCRIPTIONS
  ======================================================= */

  useEffect(() => {
    if (!user?._id) return;

    dispatch(fetchChannelSubscribers(user._id));
    dispatch(fetchChannelSubscriptions(user._id));
  }, [dispatch, user?._id]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const subscriberCount = Array.isArray(
    channelSubscribers
  )
    ? channelSubscribers.length
    : 0;

  const subscriptionCount = Array.isArray(
    channelSubscriptions
  )
    ? channelSubscriptions.length
    : 0;

  /* =======================================================
     OPEN LIST
  ======================================================= */

  const openSubscribers = () => {
    setActiveList("subscribers");
  };

  const openSubscriptions = () => {
    setActiveList("subscriptions");
  };

  /* =======================================================
     CLOSE LIST
  ======================================================= */

  const closeList = () => {
    setActiveList(null);
  };

  /* =======================================================
     GO TO CHANNEL
  ======================================================= */

  const goToChannel = (ownerId) => {
    if (!ownerId) return;

    closeList();

    navigate(`/channel/${ownerId}`);
  };

  /* =======================================================
     DELETE VIDEO
  ======================================================= */

  const handleDeleteVideo = async (videoId) => {
    if (!videoId) return;

    try {
      await dispatch(deleteVideo(videoId)).unwrap();

      setUser((previousUser) => {
        if (!previousUser) return previousUser;

        return {
          ...previousUser,
          videos: Array.isArray(previousUser.videos)
            ? previousUser.videos.filter(
                (video) => video._id !== videoId
              )
            : [],
        };
      });

      setNotification({
        type: "success",
        message: "Video deleted successfully.",
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: error || "Unable to delete video.",
      });
    }
  };

  /* =======================================================
     TOGGLE PUBLISH STATUS
  ======================================================= */

  const handleTogglePublish = async (videoId) => {
    if (!videoId) return;

    try {
      const response = await dispatch(
        togglePublishStatus(videoId)
      ).unwrap();

      const data = response?.data ?? response;

      setUser((previousUser) => {
        if (!previousUser) return previousUser;

        return {
          ...previousUser,
          videos: Array.isArray(previousUser.videos)
            ? previousUser.videos.map((video) => {
                if (video._id !== videoId) {
                  return video;
                }

                const newStatus =
                  typeof data?.isPublished === "boolean"
                    ? data.isPublished
                    : !video.isPublished;

                return {
                  ...video,
                  isPublished: newStatus,
                };
              })
            : [],
        };
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: error || "Unable to change publish status.",
      });
    }
  };

  const requestDeleteVideo = (videoId) => {
    if (!videoId) return;
    setDeleteVideoId(videoId);
  };

  const cancelDeleteVideo = () => {
    setDeleteVideoId(null);
  };

  const confirmDeleteVideo = async () => {
    if (!deleteVideoId) return;

    const videoId = deleteVideoId;
    setDeleteVideoId(null);
    await handleDeleteVideo(videoId);
  };

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-state">
          <h2>Loading profile...</h2>
          <p>
            Please wait while we load your profile.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-state">
          <h2>Unable to load profile</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-state">
          <h2>Profile not found</h2>
        </div>
      </div>
    );
  }

  /* =======================================================
     VIDEOS
  ======================================================= */

  const videos = Array.isArray(user.videos)
    ? user.videos
    : [];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="profile-page">

      {/* ===================================================
          COVER
      =================================================== */}

      <section
        className="profile-cover"
        style={{
          backgroundImage: user.coverImage
            ? `url(${user.coverImage})`
            : "none",
        }}
      >
        <div className="profile-cover-overlay" />
      </section>

      {/* ===================================================
          PROFILE INFORMATION
      =================================================== */}

      <section className="profile-header">

        <div className="profile-header-inner">

          {/* AVATAR */}

          <div className="profile-avatar">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={
                  user.fullName ||
                  user.userName ||
                  "Profile"
                }
              />
            ) : (
              <div className="profile-avatar-fallback">
                {(
                  user.fullName ||
                  user.userName ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* USER INFORMATION */}

          <div className="profile-user-info">

            <h1>
              {user.fullName || user.userName}
            </h1>

            <p className="profile-username">
              @{user.userName}
            </p>

            {/* =================================================
                PROFILE STATS
            ================================================= */}

            <div className="profile-stats">

              {/* VIDEOS */}

              <span>
                <strong>{videos.length}</strong>{" "}
                {videos.length === 1
                  ? "video"
                  : "videos"}
              </span>

              <span className="profile-stat-dot">
                •
              </span>

              {/* SUBSCRIBERS */}

              <button
                type="button"
                className="profile-stat-button"
                onClick={openSubscribers}
              >
                <strong>
                  {subscriberCount}
                </strong>{" "}
                {subscriberCount === 1
                  ? "subscriber"
                  : "subscribers"}
              </button>

              <span className="profile-stat-dot">
                •
              </span>

              {/* SUBSCRIPTIONS */}

              <button
                type="button"
                className="profile-stat-button"
                onClick={openSubscriptions}
              >
                <strong>
                  {subscriptionCount}
                </strong>{" "}
                subscriptions
              </button>

              <span className="profile-stat-dot">
                •
              </span>

              {/* MEMBER SINCE */}

              <span>
                Member since{" "}
                {user.createdAt
                  ? new Date(
                      user.createdAt
                    ).getFullYear()
                  : "—"}
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          VIDEOS
      =================================================== */}

      <main className="profile-content">

        <div className="profile-section-heading">
          <div>
            <h2>Your videos</h2>

            <p>
              Videos uploaded to your Streamo
              channel
            </p>
          </div>
        </div>

        {videos.length > 0 ? (
          <div className="profile-video-grid">
            {videos.map((video) => (
              <ProfileVideoCard
                key={video._id}
                video={video}
                onDelete={requestDeleteVideo}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        ) : (
          <div className="profile-empty">
            <h2>No videos yet</h2>

            <p>
              Upload your first video and it
              will appear here.
            </p>
          </div>
        )}

      </main>

      {/* ===================================================
          SUBSCRIBERS / SUBSCRIPTIONS MODAL
      =================================================== */}

      {activeList && (
        <div
          className="profile-list-backdrop"
          onClick={closeList}
        >
          <div
            className="profile-list-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="profile-list-header">

              <div>
                <h2>
                  {activeList === "subscribers"
                    ? "Subscribers"
                    : "Subscriptions"}
                </h2>

                <p>
                  {activeList === "subscribers"
                    ? `${subscriberCount} ${
                        subscriberCount === 1
                          ? "person"
                          : "people"
                      } subscribed to your channel`
                    : `${subscriptionCount} ${
                        subscriptionCount === 1
                          ? "channel"
                          : "channels"
                      } you subscribed to`}
                </p>
              </div>

              <button
                type="button"
                className="profile-list-close"
                onClick={closeList}
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="profile-list-content">

              {subscriptionLoading ? (
                <div className="profile-list-state">
                  Loading...
                </div>
              ) : subscriptionError ? (
                <div className="profile-list-state profile-list-error">
                  {subscriptionError}
                </div>
              ) : activeList === "subscribers" ? (

                subscriberCount > 0 ? (
                  channelSubscribers.map(
                    (subscription) => (
                      <ChannelUserItem
                        key={
                          subscription._id
                        }
                        user={
                          subscription.subscriber
                        }
                        onClick={goToChannel}
                      />
                    )
                  )
                ) : (
                  <div className="profile-list-state">
                    <h3>No subscribers yet</h3>
                    <p>
                      People who subscribe to
                      your channel will appear
                      here.
                    </p>
                  </div>
                )

              ) : (

                subscriptionCount > 0 ? (
                  channelSubscriptions.map(
                    (subscription) => (
                      <ChannelUserItem
                        key={
                          subscription._id
                        }
                        user={
                          subscription.channel
                        }
                        onClick={goToChannel}
                      />
                    )
                  )
                ) : (
                  <div className="profile-list-state">
                    <h3>
                      No subscriptions yet
                    </h3>
                    <p>
                      Channels you subscribe to
                      will appear here.
                    </p>
                  </div>
                )

              )}

            </div>

          </div>
        </div>
      )}

      {notification && (
        <div
          className={`profile-notification profile-notification-${notification.type}`}
          role="status"
        >
          <span className="profile-notification-icon">
            {notification.type === "success" ? "✓" : "!"}
          </span>

          <span className="profile-notification-message">
            {notification.message}
          </span>

          <button
            type="button"
            className="profile-notification-close"
            onClick={() => setNotification(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {deleteVideoId && (
        <div
          className="profile-confirm-backdrop"
          onClick={cancelDeleteVideo}
        >
          <div
            className="profile-confirm-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-video-title"
          >
            <div className="profile-confirm-icon">
              !
            </div>

            <div className="profile-confirm-content">
              <h2 id="delete-video-title">
                Delete video?
              </h2>

              <p>
                Are you sure you want to delete this video?
                This action cannot be undone.
              </p>
            </div>

            <div className="profile-confirm-actions">
              <button
                type="button"
                className="profile-confirm-cancel"
                onClick={cancelDeleteVideo}
              >
                Cancel
              </button>

              <button
                type="button"
                className="profile-confirm-delete"
                onClick={confirmDeleteVideo}
              >
                Delete video
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}