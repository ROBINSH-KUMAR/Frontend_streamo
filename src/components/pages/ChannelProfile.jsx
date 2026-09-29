
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getUserChannel } from "../../api/authApi";

import {
  toggleChannelSubscription,
  fetchChannelSubscribers,
  fetchChannelSubscriptions,
} from "../../redux/slices/subscriptionSlice";

import "./ChannelProfile.css";

/* =========================================================
   HELPERS
========================================================= */

const formatViews = (views) => {
  const count = Number(views) || 0;

  if (count >= 1000000000) {
    return `${(count / 1000000000).toFixed(1)}B`;
  }

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return count.toString();
};

const formatDuration = (seconds) => {
  const value = Number(seconds);

  if (!Number.isFinite(value)) {
    return "00:00";
  }

  const totalSeconds = Math.floor(value);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
};

const formatDate = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/* =========================================================
   MEMBER SINCE
========================================================= */

const getMemberSince = (date) => {
  if (!date) {
    return "2026";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "2026";
  }

  return parsed.getFullYear();
};

/* =========================================================
   GET USER FROM SUBSCRIPTION ITEM
========================================================= */

const getListUser = (item) => {
  if (!item) return null;

  if (
    item.channel &&
    typeof item.channel === "object"
  ) {
    return item.channel;
  }

  if (
    item.subscriber &&
    typeof item.subscriber === "object"
  ) {
    return item.subscriber;
  }

  if (
    item.subscribedTo &&
    typeof item.subscribedTo === "object"
  ) {
    return item.subscribedTo;
  }

  if (
    item.user &&
    typeof item.user === "object"
  ) {
    return item.user;
  }

  if (
    item.owner &&
    typeof item.owner === "object"
  ) {
    return item.owner;
  }

  return item;
};

const getUserId = (item) => {
  const user = getListUser(item);

  return (
    user?._id ||
    user?.id ||
    user?.userId ||
    user?.ownerId ||
    ""
  );
};

const getUsername = (item) => {
  const user = getListUser(item);

  return (
    user?.userName ||
    user?.username ||
    user?.user_name ||
    ""
  );
};

const getFullName = (item) => {
  const user = getListUser(item);

  return (
    user?.fullName ||
    user?.name ||
    user?.displayName ||
    getUsername(item) ||
    "Unknown User"
  );
};

const getAvatar = (item) => {
  const user = getListUser(item);

  return (
    user?.avatar ||
    user?.profileImage ||
    user?.profilePicture ||
    ""
  );
};

/* =========================================================
   PLAY ICON
========================================================= */

const PlayIcon = () => (
  <svg
    className="channel-play-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M8 5v14l11-7L8 5z" />
  </svg>
);

/* =========================================================
   CLOSE ICON
========================================================= */

const CloseIcon = () => (
  <svg
    className="channel-modal-close-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/* =========================================================
   USER ICON
========================================================= */

const UserIcon = () => (
  <svg
    className="channel-default-user-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
  </svg>
);

/* =========================================================
   SUBSCRIBER / SUBSCRIPTION MODAL
========================================================= */

function ChannelListModal({
  type,
  items,
  loading,
  error,
  onClose,
  onUserClick,
}) {
  const isSubscribers = type === "subscribers";

  const title = isSubscribers
    ? "Subscribers"
    : "Subscriptions";

  const description = isSubscribers
    ? "People subscribed to this channel"
    : "Channels this channel has subscribed to";

  return (
    <div
      className="channel-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="channel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="channel-modal-title"
      >
        <div className="channel-modal-header">
          <div>
            <h2 id="channel-modal-title">{title}</h2>
            <p>{description}</p>
          </div>

          <button
            type="button"
            className="channel-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="channel-modal-content">
          {loading ? (
            <div className="channel-list-state">
              <div className="channel-list-spinner" />
              <p>
                Loading {title.toLowerCase()}...
              </p>
            </div>
          ) : error ? (
            <div className="channel-list-state">
              <div className="channel-list-error-icon">
                !
              </div>

              <h3>Something went wrong</h3>

              <p>{error}</p>
            </div>
          ) : !items.length ? (
            <div className="channel-list-state">
              <div className="channel-list-empty-icon">
                {isSubscribers ? "👥" : "📺"}
              </div>

              <h3>
                {isSubscribers
                  ? "No subscribers yet"
                  : "No subscriptions yet"}
              </h3>

              <p>
                {isSubscribers
                  ? "Nobody has subscribed to this channel yet."
                  : "This channel hasn't subscribed to any channels yet."}
              </p>
            </div>
          ) : (
            <div className="channel-user-list">
              {items.map((item, index) => {
                const user = getListUser(item);

                const userId = getUserId(item);
                const username = getUsername(item);
                const fullName = getFullName(item);
                const avatar = getAvatar(item);

                const route = username
                  ? `/channel/${username}`
                  : userId
                  ? `/channel/${userId}`
                  : null;

                return (
                  <button
                    key={
                      userId ||
                      username ||
                      `${fullName}-${index}`
                    }
                    type="button"
                    className="channel-user-list-item"
                    disabled={!route}
                    onClick={() => {
                      if (route) {
                        onUserClick(route);
                      }
                    }}
                  >
                    <div className="channel-list-avatar">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={fullName}
                          loading="lazy"
                        />
                      ) : (
                        <UserIcon />
                      )}
                    </div>

                    <div className="channel-list-user-info">
                      <strong>{fullName}</strong>

                      {username && (
                        <span>@{username}</span>
                      )}
                    </div>

                    <span className="channel-list-arrow">
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   VIDEO CARD
========================================================= */

function ChannelVideoCard({ video, channel }) {
  return (
    <a
      href={`/watch/${video._id}`}
      className="channel-video-card-link"
    >
      <article className="channel-video-card">
        <div className="channel-video-thumbnail">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={
                video.title || "Video thumbnail"
              }
              loading="lazy"
            />
          ) : (
            <div className="channel-thumbnail-fallback">
              <PlayIcon />
            </div>
          )}

          <div className="channel-thumbnail-gradient" />

          <div className="channel-thumbnail-overlay">
            <div className="channel-play-button">
              <PlayIcon />
            </div>
          </div>

          <span className="channel-video-duration">
            {formatDuration(video.duration)}
          </span>

          <div className="channel-thumbnail-content">
            <h3>
              {video.title || "Untitled video"}
            </h3>

            {video.createdAt && (
              <span>
                {new Date(
                  video.createdAt
                ).getFullYear()}
              </span>
            )}
          </div>
        </div>

        <div className="channel-video-info">
          <div className="channel-video-avatar">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={
                  channel.fullName ||
                  channel.userName ||
                  "Channel"
                }
                loading="lazy"
              />
            ) : (
              <div className="channel-avatar-fallback">
                {(
                  channel.fullName ||
                  channel.userName ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          <div className="channel-video-details">
            <p className="channel-video-description">
              {video.description ||
                "No description"}
            </p>

            <span className="channel-video-name">
              {channel.fullName ||
                channel.userName ||
                "Unknown creator"}
            </span>

            <div className="channel-video-meta">
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
    </a>
  );
}

/* =========================================================
   CHANNEL PROFILE
========================================================= */

export default function ChannelProfile() {
  const { username } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    channelSubscribers,
    channelSubscriptions,
    loading: subscriptionLoading,
    error: subscriptionError,
  } = useSelector(
    (state) => state.subscription
  );

  const [channel, setChannel] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [
    subscribeLoading,
    setSubscribeLoading,
  ] = useState(false);

  const [listModal, setListModal] =
    useState(null);

  /* =======================================================
     LOAD CHANNEL
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadChannel = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getUserChannel(username);

        if (!mounted) return;

        const channelData =
          response?.data;

        if (!channelData) {
          throw new Error(
            "Channel data not found"
          );
        }

        setChannel(channelData);
      } catch (err) {
        console.error(
          "Channel profile error:",
          err
        );

        if (!mounted) return;

        setChannel(null);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load channel."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (username) {
      loadChannel();
    } else {
      setLoading(false);
      setError(
        "Channel username is missing."
      );
    }

    return () => {
      mounted = false;
    };
  }, [username]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setListModal(null);
      }
    };

    if (listModal) {
      document.addEventListener(
        "keydown",
        handleKeyDown
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [listModal]);

  /* =======================================================
     SUBSCRIBE
  ======================================================= */

  const handleSubscribe = async () => {
    if (
      !channel?._id ||
      subscribeLoading
    ) {
      return;
    }

    try {
      setSubscribeLoading(true);

      const response =
        await dispatch(
          toggleChannelSubscription(
            channel._id
          )
        ).unwrap();

      const subscribed =
        response?.data?.subscribed ??
        response?.subscribed;

      if (
        typeof subscribed === "boolean"
      ) {
        setChannel((previous) => {
          if (!previous) {
            return previous;
          }

          const currentCount =
            Number(
              previous.subscribersCount
            ) || 0;

          return {
            ...previous,
            isSubscribed: subscribed,
            subscribersCount: subscribed
              ? currentCount + 1
              : Math.max(
                  0,
                  currentCount - 1
                ),
          };
        });
      } else {
        const refreshed =
          await getUserChannel(username);

        setChannel(
          refreshed?.data || channel
        );
      }
    } catch (err) {
      console.error(
        "Subscription error:",
        err
      );
    } finally {
      setSubscribeLoading(false);
    }
  };

  /* =======================================================
     OPEN LISTS
  ======================================================= */

  const handleOpenSubscribers = () => {
    if (!channel?._id) return;

    setListModal("subscribers");

    dispatch(
      fetchChannelSubscribers(
        channel._id
      )
    );
  };

  const handleOpenSubscriptions = () => {
    if (!channel?._id) return;

    setListModal("subscriptions");

    dispatch(
      fetchChannelSubscriptions(
        channel._id
      )
    );
  };

  const handleUserClick = (route) => {
    setListModal(null);
    navigate(route);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="channel-page">
        <div className="channel-state">
          <div className="channel-loading-spinner" />

          <h2>Loading channel...</h2>

          <p>
            Please wait while we load
            the channel.
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
      <div className="channel-page">
        <div className="channel-state">
          <div className="channel-error-icon">
            !
          </div>

          <h2>
            Unable to load channel
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="channel-retry-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="channel-page">
        <div className="channel-state">
          <h2>Channel not found</h2>

          <p>
            We couldn't find this
            channel.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     CHANNEL DATA
  ======================================================= */

  const videos = Array.isArray(
    channel.videos
  )
    ? channel.videos
    : [];

  const totalViews = videos.reduce(
    (total, video) =>
      total +
      (Number(video.views) || 0),
    0
  );

  const currentList =
    listModal === "subscribers"
      ? channelSubscribers
      : channelSubscriptions;

  /* =======================================================
     MEMBER SINCE
  ======================================================= */

  const memberSince = getMemberSince(
    channel.createdAt ||
      channel.created_at ||
      channel.joinedAt ||
      channel.joined_at
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="channel-page">
      {/* ===================================================
          COVER
      =================================================== */}

      <section
        className="channel-cover"
        style={{
          backgroundImage:
            channel.coverImage
              ? `url("${channel.coverImage}")`
              : "none",
        }}
      >
        <div className="channel-cover-overlay" />
      </section>

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="channel-header">
        <div className="channel-header-inner">
          {/* AVATAR */}

          <div className="channel-avatar">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={
                  channel.fullName ||
                  channel.userName ||
                  "Channel"
                }
              />
            ) : (
              <div className="channel-avatar-large-fallback">
                {(
                  channel.fullName ||
                  channel.userName ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* CHANNEL INFORMATION */}

          <div className="channel-user-info">
            <h1>
              {channel.fullName ||
                channel.userName ||
                "Unknown channel"}
            </h1>

            <p className="channel-username">
              @{channel.userName}
            </p>

            {/* MEMBER SINCE */}

            <p className="channel-member-since">
              Member since {memberSince}
            </p>

            {/* STATS */}

            <div className="channel-stats">
              <button
                type="button"
                className="channel-stat-button"
                onClick={
                  handleOpenSubscribers
                }
              >
                <strong>
                  {channel.subscribersCount ||
                    0}
                </strong>

                <span>subscribers</span>
              </button>

              <span className="channel-stat-dot">
                •
              </span>

              <button
                type="button"
                className="channel-stat-button"
                onClick={
                  handleOpenSubscriptions
                }
              >
                <strong>
                  {channel.subscribedToCount ||
                    0}
                </strong>

                <span>subscriptions</span>
              </button>

              <span className="channel-stat-dot">
                •
              </span>

              <span>
                <strong>
                  {videos.length}
                </strong>{" "}
                videos
              </span>

              <span className="channel-stat-dot">
                •
              </span>

              <span>
                <strong>
                  {formatViews(
                    totalViews
                  )}
                </strong>{" "}
                views
              </span>
            </div>
          </div>

          {/* SUBSCRIBE */}

          <div className="channel-actions">
            <button
              type="button"
              className={`channel-subscribe-button ${
                channel.isSubscribed
                  ? "subscribed"
                  : ""
              }`}
              disabled={
                subscribeLoading
              }
              onClick={
                handleSubscribe
              }
            >
              {subscribeLoading ? (
                <span className="subscribe-button-spinner" />
              ) : channel.isSubscribed ? (
                "Subscribed"
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="channel-content">
        <div className="channel-section-heading">
          <div>
            <h2>Videos</h2>

            <p>
              Latest videos from{" "}
              {channel.fullName ||
                channel.userName}
            </p>
          </div>
        </div>

        {videos.length > 0 ? (
          <div className="channel-video-grid">
            {videos.map((video) => (
              <ChannelVideoCard
                key={video._id}
                video={video}
                channel={channel}
              />
            ))}
          </div>
        ) : (
          <div className="channel-empty">
            <div className="channel-empty-icon">
              ▶
            </div>

            <h2>No videos yet</h2>

            <p>
              This channel hasn't
              uploaded any videos yet.
            </p>
          </div>
        )}
      </main>

      {/* ===================================================
          MODAL
      =================================================== */}

      {listModal && (
        <ChannelListModal
          type={listModal}
          items={
            Array.isArray(currentList)
              ? currentList
              : []
          }
          loading={
            subscriptionLoading
          }
          error={
            subscriptionError
          }
          onClose={() =>
            setListModal(null)
          }
          onUserClick={
            handleUserClick
          }
        />
      )}
    </div>
  );
}
