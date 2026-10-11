import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import "./Reel.css";

import {
  fetchVideos,
  likeVideo,
  unlikeVideo,
} from "../../redux/slices/videoSlice";

import { toggleVideoSubscription } from "../../redux/slices/subscriptionSlice";

function Reel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { videos = [], loading, error } = useSelector(
    (state) => state.videos
  );
  const currentUser = useSelector((state) => state.auth?.user);

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [likeBusy, setLikeBusy] = useState({});
  const [subscriptionBusy, setSubscriptionBusy] = useState({});
  const [subscriptionOverrides, setSubscriptionOverrides] = useState({});

  const videoRefs = useRef([]);
  const viewerRef = useRef(null);
  const touchStartY = useRef(null);
  const wheelLock = useRef(false);
  const wheelTimer = useRef(null);
  const activeIndexRef = useRef(activeIndex);

  const activeVideo = videos[activeIndex];

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (!videos.length) dispatch(fetchVideos());
  }, [dispatch, videos.length]);

  const goToIndex = useCallback(
    (nextIndex) => {
      if (!videos.length) return;
      const boundedIndex = Math.max(0, Math.min(nextIndex, videos.length - 1));
      if (boundedIndex === activeIndexRef.current) return;
      activeIndexRef.current = boundedIndex;
      setActiveIndex(boundedIndex);
      setProgress(0);
    },
    [videos.length]
  );

  const goNext = useCallback(() => {
    goToIndex(activeIndexRef.current + 1);
  }, [goToIndex]);

  const goPrevious = useCallback(() => {
    goToIndex(activeIndexRef.current - 1);
  }, [goToIndex]);

  // Autoplay the active reel and pause every other video.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeIndex) {
        video.muted = muted;
        video.currentTime = 0;
        video.play().catch(() => {
          // Mobile browsers may require a user gesture before playback.
        });
      } else {
        video.pause();
      }
    });
  }, [activeIndex, muted, videos]);

  // Keyboard navigation, matching the desktop reel controls.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["BUTTON", "INPUT", "TEXTAREA", "SELECT", "A"].includes(target.tagName))
      ) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        goPrevious();
      } else if (event.key === " " && activeVideo) {
        event.preventDefault();
        const video = videoRefs.current[activeIndexRef.current];
        if (!video) return;
        if (video.paused) video.play().catch(() => {});
        else video.pause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideo, goNext, goPrevious]);

  useEffect(
    () => () => {
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
    },
    []
  );

  const handleWheel = (event) => {
    // Do not switch reels when the user scrolls over a control/menu.
    if (event.target.closest("button, a")) return;
    if (wheelLock.current || Math.abs(event.deltaY) < 25) return;

    wheelLock.current = true;
    if (event.deltaY > 0) goNext();
    else goPrevious();

    if (wheelTimer.current) clearTimeout(wheelTimer.current);
    wheelTimer.current = setTimeout(() => {
      wheelLock.current = false;
    }, 650);
  };

  const handleTouchStart = (event) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartY.current === null) return;

    const endY = event.changedTouches[0]?.clientY;
    const distance = touchStartY.current - endY;
    touchStartY.current = null;

    if (Math.abs(distance) < 45) return;
    if (distance > 0) goNext();
    else goPrevious();
  };

  const handleLike = async (video) => {
    if (!video?._id || likeBusy[video._id]) return;

    const wasLiked = Boolean(video.isLiked);
    setLikeBusy((current) => ({ ...current, [video._id]: true }));

    try {
      // Reuse the exact Redux actions used by VideoCard.jsx.
      await dispatch(wasLiked ? unlikeVideo(video._id) : likeVideo(video._id)).unwrap();
    } catch (requestError) {
      console.error("Unable to update video like:", requestError);
    } finally {
      setLikeBusy((current) => ({ ...current, [video._id]: false }));
    }
  };

  const getIsSubscribed = (video) => {
    if (!video?._id) return false;
    if (typeof subscriptionOverrides[video._id] === "boolean") {
      return subscriptionOverrides[video._id];
    }
    return Boolean(video.isSubscribed ?? video.owner?.isSubscribed);
  };

  const handleSubscription = async (video) => {
    if (!video?._id || subscriptionBusy[video._id]) return;

    const ownerId = video.owner?._id;
    if (!ownerId) {
      console.error("Channel owner ID is missing.");
      return;
    }

    // Do not show a subscribe action on the signed-in user's own channel.
    if (currentUser?._id && currentUser._id === ownerId) return;

    const wasSubscribed = getIsSubscribed(video);
    setSubscriptionBusy((current) => ({ ...current, [video._id]: true }));

    try {
      // Same thunk/API action used by VideoCard.jsx.
      const response = await dispatch(toggleVideoSubscription(video._id)).unwrap();
      const data = response?.data ?? response;
      const returnedState =
        data?.subscribed ??
        data?.isSubscribed ??
        data?.subscription?.isSubscribed;

      setSubscriptionOverrides((current) => ({
        ...current,
        [video._id]:
          typeof returnedState === "boolean" ? returnedState : !wasSubscribed,
      }));
    } catch (requestError) {
      console.error("Unable to update subscription:", requestError);
    } finally {
      setSubscriptionBusy((current) => ({ ...current, [video._id]: false }));
    }
  };

  const handleVideoClick = (event) => {
    const video = event.currentTarget;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const handleTimeUpdate = (event) => {
    const video = event.currentTarget;
    if (!video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const openChannel = (video) => {
    const ownerId = video?.owner?._id;
    if (!ownerId) {
      console.error("Channel owner ID is missing.");
      return;
    }
    // Match VideoCard.jsx exactly: channel route uses the owner's Mongo ID.
    navigate(`/channel/${ownerId}`);
  };

  const openVideo = (videoId) => {
    if (videoId) navigate(`/watch/${videoId}`);
  };

  const formatCount = (value = 0) => {
    const count = Number(value) || 0;
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return String(count);
  };

  if (loading && !videos.length) {
    return (
      <div className="reel-page">
        <div className="reel-loading">
          <div className="reel-spinner" />
          <p>Loading reels...</p>
        </div>
      </div>
    );
  }

  if (error && !videos.length) {
    return (
      <div className="reel-page">
        <div className="reel-empty">
          <div className="reel-empty-icon">!</div>
          <h2>Unable to load videos</h2>
          <p>{String(error)}</p>
          <button type="button" onClick={() => dispatch(fetchVideos())}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="reel-page">
        <div className="reel-empty">
          <div className="reel-empty-icon">▶</div>
          <h2>No videos available</h2>
          <p>There are no videos available to watch right now.</p>
          <button type="button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <main
      className="reel-page"
      ref={viewerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Video reels"
    >
      <button
        type="button"
        className="reel-back"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <span aria-hidden="true">←</span> Back
      </button>

      <div className="reel-counter" aria-live="polite">
        {activeIndex + 1} / {videos.length}
      </div>

      <div className="reel-viewer">
        {videos.map((video, index) => {
          const owner = video.owner || {};
          const username = owner.userName || owner.username || "Creator";
          const fullName = owner.fullName || username;
          const avatar = owner.avatar || "/default-avatar.png";
          const isActive = index === activeIndex;
          const isLiked = Boolean(video.isLiked);
          const isSubscribed = getIsSubscribed(video);
          const isOwnChannel =
            Boolean(currentUser?._id && currentUser._id === owner._id);

          return (
            <article
              key={video._id || index}
              className={`reel-item ${
                isActive ? "reel-item-active" : ""
              } ${index < activeIndex ? "reel-item-before" : ""} ${
                index > activeIndex ? "reel-item-after" : ""
              }`}
              aria-hidden={!isActive}
            >
              <video
                ref={(element) => {
                  videoRefs.current[index] = element;
                }}
                className="reel-video"
                src={video.videoFile}
                poster={video.thumbnail}
                playsInline
                loop={false}
                muted={muted}
                preload={isActive ? "auto" : "metadata"}
                onClick={handleVideoClick}
                onTimeUpdate={isActive ? handleTimeUpdate : undefined}
                onEnded={isActive ? goNext : undefined}
                tabIndex={isActive ? 0 : -1}
              />

              <div className="reel-gradient" />

              {isActive && (
                <>
                  <div className="reel-top">
                    <div className="reel-top-title">Reels</div>
                    <button
                      type="button"
                      className="reel-mute"
                      onClick={() => setMuted((value) => !value)}
                      title={muted ? "Unmute" : "Mute"}
                      aria-label={muted ? "Unmute video" : "Mute video"}
                    >
                      {muted ? "🔇" : "🔊"}
                    </button>
                  </div>

                  <div className="reel-actions">
                    <button
                      type="button"
                      className={`reel-action ${isLiked ? "reel-liked" : ""}`}
                      onClick={() => handleLike(video)}
                      disabled={Boolean(likeBusy[video._id])}
                      aria-label={isLiked ? "Unlike video" : "Like video"}
                    >
                      <span className="reel-action-icon">{isLiked ? "♥" : "♡"}</span>
                      <span>{likeBusy[video._id] ? "…" : formatCount(video.likes)}</span>
                    </button>

                    <button
                      type="button"
                      className="reel-action"
                      onClick={() => openVideo(video._id)}
                      aria-label="Open video and comments"
                    >
                      <span className="reel-action-icon">▢</span>
                      <span>Comments</span>
                    </button>

                    <button
                      type="button"
                      className="reel-action"
                      onClick={() => openVideo(video._id)}
                      aria-label="Open full video"
                    >
                      <span className="reel-action-icon">↗</span>
                      <span>Watch</span>
                    </button>
                  </div>

                  <section className="reel-info">
                    <div className="reel-channel">
                      <button
                        type="button"
                        className="reel-avatar-button"
                        onClick={() => openChannel(video)}
                        aria-label={`Visit ${fullName}'s channel`}
                      >
                        <img className="reel-avatar" src={avatar} alt="" />
                      </button>

                      <button
                        type="button"
                        className="reel-channel-name"
                        onClick={() => openChannel(video)}
                        title={`Visit ${fullName}'s channel`}
                      >
                        <strong>{fullName}</strong>
                        <span>@{username}</span>
                      </button>

                      {!isOwnChannel && (
                        <button
                          type="button"
                          className={`reel-follow ${
                            isSubscribed ? "reel-follow-subscribed" : ""
                          }`}
                          disabled={Boolean(subscriptionBusy[video._id])}
                          onClick={() => handleSubscription(video)}
                        >
                          {subscriptionBusy[video._id]
                            ? "..."
                            : isSubscribed
                            ? "Subscribed"
                            : "Subscribe"}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="reel-title"
                      onClick={() => openVideo(video._id)}
                    >
                      {video.title || "Untitled video"}
                    </button>

                    {video.description && (
                      <p className="reel-description">{video.description}</p>
                    )}

                    <div className="reel-meta">
                      <span>{formatCount(video.views)} views</span>
                      <span>•</span>
                      <button
                        type="button"
                        className="reel-full-video-link"
                        onClick={() => openVideo(video._id)}
                      >
                        Watch full video →
                      </button>
                    </div>
                  </section>

                  <div className="reel-progress" aria-label="Video progress">
                    <div
                      className="reel-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <div className="reel-navigation" aria-label="Reel navigation">
        <button
          type="button"
          className="reel-nav-button"
          onClick={goPrevious}
          disabled={activeIndex === 0}
          aria-label="Previous reel"
        >
          ↑
        </button>
        <button
          type="button"
          className="reel-nav-button"
          onClick={goNext}
          disabled={activeIndex === videos.length - 1}
          aria-label="Next reel"
        >
          ↓
        </button>
      </div>

      <div className="reel-hint" aria-hidden="true">
        <span>↑</span>
        <span>Scroll or swipe to explore</span>
        <span>↓</span>
      </div>
    </main>
  );
}

export default Reel;
