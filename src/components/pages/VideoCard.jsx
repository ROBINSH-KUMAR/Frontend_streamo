import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./VideoCard.css";

import {
  fetchVideos,
  incrementVideoView,
  likeVideo,
} from "../../redux/slices/videoSlice";

import {
  toggleVideoSubscription,
} from "../../redux/slices/subscriptionSlice";

import { addToWatchHistory } from "../../redux/slices/historySlice";

// =========================================================
// HELPERS
// =========================================================

const formatViews = (views = 0) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }

  return `${views} views`;
};

const formatDuration = (seconds = 0) => {
  if (!seconds || seconds <= 0) return "0:00";

  const totalSeconds = Math.floor(seconds);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  }

  return `${minutes}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

const formatTimeAgo = (date) => {
  if (!date) return "";

  const now = new Date();
  const createdDate = new Date(date);

  const difference = now - createdDate;

  const seconds = Math.floor(
    difference / 1000
  );

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} ${
      years === 1 ? "year" : "years"
    } ago`;
  }

  if (months > 0) {
    return `${months} ${
      months === 1 ? "month" : "months"
    } ago`;
  }

  if (weeks > 0) {
    return `${weeks} ${
      weeks === 1 ? "week" : "weeks"
    } ago`;
  }

  if (days > 0) {
    return `${days} ${
      days === 1 ? "day" : "days"
    } ago`;
  }

  if (hours > 0) {
    return `${hours} ${
      hours === 1 ? "hour" : "hours"
    } ago`;
  }

  if (minutes > 0) {
    return `${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  return "Just now";
};

// =========================================================
// YOUTUBE HELPERS
// =========================================================

const isYouTubeUrl = (url = "") => {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  );
};

const getYouTubeId = (url = "") => {
  try {
    const parsedUrl = new URL(url);

    // https://youtu.be/lYCADK9ehXg
    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.replace("/", "");
    }

    // https://www.youtube.com/watch?v=lYCADK9ehXg
    if (
      parsedUrl.hostname.includes("youtube.com")
    ) {
      return parsedUrl.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
};

// =========================================================
// VIDEO CARD
// =========================================================

function VideoCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // =======================================================
  // REFS
  // =======================================================

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hideControlsTimer = useRef(null);
  const playerMoreMenuRef = useRef(null);

  // =======================================================
  // PLAYER STATE
  // =======================================================

  const [isCinemaMode, setIsCinemaMode] =
    useState(false);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(1);

  const [isMuted, setIsMuted] =
    useState(false);

  const [showControls, setShowControls] =
    useState(true);

  // =======================================================
  // THREE DOT MENU
  // =======================================================

  const [showMoreMenu, setShowMoreMenu] =
    useState(false);

  // =======================================================
  // PLAYBACK SPEED
  // =======================================================

  const [showSpeedMenu, setShowSpeedMenu] =
    useState(false);

  const [playbackRate, setPlaybackRate] =
    useState(1);

  // =======================================================
  // EXTRA OPTIONS
  // =======================================================

  const [showStats, setShowStats] =
    useState(false);

  const [showTranscript, setShowTranscript] =
    useState(false);

  // =======================================================
  // SUBSCRIPTION
  // =======================================================

  const [isVideoSubscribed, setIsVideoSubscribed] =
    useState(false);

  const [subscribeLoading, setSubscribeLoading] =
    useState(false);

  // =======================================================
  // LIKE STATE
  // =======================================================

  const [isLiked, setIsLiked] =
    useState(false);

  const [likeCount, setLikeCount] =
    useState(0);

  const [likeLoading, setLikeLoading] =
    useState(false);

  // =======================================================
  // REDUX
  // =======================================================

  const {
    videos,
    loading,
    error,
  } = useSelector(
    (state) => state.videos
  );

  // =======================================================
  // FETCH VIDEOS
  // =======================================================

  useEffect(() => {
    if (!videos || videos.length === 0) {
      dispatch(fetchVideos());
    }
  }, [dispatch, videos]);

  // =======================================================
  // CURRENT VIDEO
  // =======================================================

  const currentVideo = videos?.find(
    (video) => video._id === id
  );

  // =======================================================
  // YOUTUBE
  // =======================================================

  const youtubeVideo =
    currentVideo?.videoFile &&
    isYouTubeUrl(currentVideo.videoFile);

  const youtubeId = youtubeVideo
    ? getYouTubeId(currentVideo.videoFile)
    : null;

  // =======================================================
  // RESET PLAYER WHEN VIDEO CHANGES
  // =======================================================

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackRate(1);

    setShowMoreMenu(false);
    setShowSpeedMenu(false);
    setShowStats(false);
    setShowTranscript(false);

    setIsVideoSubscribed(
      currentVideo?.isSubscribed ?? false
    );

    setIsLiked(
      Boolean(currentVideo?.isLiked)
    );

    setLikeCount(
      Number(currentVideo?.likes) || 0
    );

    if (videoRef.current?.textTracks) {
      Array.from(
        videoRef.current.textTracks
      ).forEach((track) => {
        track.mode = "hidden";
      });
    }
  }, [currentVideo?._id]);

  // =======================================================
  // AUTOPLAY - CLOUDINARY ONLY
  // =======================================================

  useEffect(() => {
    if (youtubeVideo) return;

    if (
      !currentVideo?._id ||
      !videoRef.current
    ) {
      return;
    }

    const video = videoRef.current;

    video.currentTime = 0;
    video.playbackRate = 1;

    if (video.textTracks) {
      Array.from(
        video.textTracks
      ).forEach((track) => {
        track.mode = "hidden";
      });
    }

    video
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  }, [
    currentVideo?._id,
    youtubeVideo,
  ]);

  // =======================================================
  // CLEANUP
  // =======================================================

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(
          hideControlsTimer.current
        );
      }
    };
  }, []);

  // =======================================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // =======================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        playerMoreMenuRef.current &&
        !playerMoreMenuRef.current.contains(
          event.target
        )
      ) {
        setShowMoreMenu(false);
        setShowSpeedMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =======================================================
  // SHOW CONTROLS
  // =======================================================

  const revealControls = () => {
    setShowControls(true);

    if (hideControlsTimer.current) {
      clearTimeout(
        hideControlsTimer.current
      );
    }

    if (
      isPlaying &&
      !showMoreMenu
    ) {
      hideControlsTimer.current =
        setTimeout(() => {
          setShowControls(false);
        }, 2500);
    }
  };

  // =======================================================
  // PLAY / PAUSE
  // =======================================================

  const togglePlay = async (event) => {
    if (event) {
      event.stopPropagation();
    }

    if (youtubeVideo) {
      return;
    }

    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (err) {
      console.error(
        "Unable to control video:",
        err
      );
    }

    revealControls();
  };

  // =======================================================
  // VIDEO CLICK
  // =======================================================

  const handleVideoClick = (event) => {
    if (youtubeVideo) return;

    if (
      event.target.closest(
        ".video-control-bar"
      ) ||
      event.target.closest(
        ".center-play-button"
      ) ||
      event.target.closest(
        ".player-more-menu"
      )
    ) {
      return;
    }

    togglePlay();
  };

  // =======================================================
  // VIDEO EVENTS
  // =======================================================

  const handleVideoPlay = () => {
    setIsPlaying(true);
    revealControls();
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    setShowControls(true);

    if (hideControlsTimer.current) {
      clearTimeout(
        hideControlsTimer.current
      );
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentTime(
      videoRef.current.currentTime
    );
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;

    setDuration(
      videoRef.current.duration || 0
    );

    if (videoRef.current.textTracks) {
      Array.from(
        videoRef.current.textTracks
      ).forEach((track) => {
        track.mode = "hidden";
      });
    }
  };

  // =======================================================
  // SEEK
  // =======================================================

  const handleSeek = (event) => {
    const value = Number(
      event.target.value
    );

    if (!videoRef.current) return;

    videoRef.current.currentTime = value;
    setCurrentTime(value);

    revealControls();
  };

  // =======================================================
  // VOLUME
  // =======================================================

  const handleVolumeChange = (event) => {
    const value = Number(
      event.target.value
    );

    if (!videoRef.current) return;

    videoRef.current.volume = value;

    if (value > 0) {
      videoRef.current.muted = false;
    }

    setVolume(value);
    setIsMuted(value === 0);
  };

  // =======================================================
  // MUTE
  // =======================================================

  const toggleMute = (event) => {
    event.stopPropagation();

    const video = videoRef.current;

    if (!video) return;

    if (
      video.muted ||
      video.volume === 0
    ) {
      video.muted = false;

      if (volume === 0) {
        video.volume = 0.7;
        setVolume(0.7);
      }

      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }

    revealControls();
  };

  // =======================================================
  // FULLSCREEN
  // =======================================================

  const toggleFullscreen = async (event) => {
    event.stopPropagation();

    const player = playerRef.current;

    if (!player) return;

    try {
      if (!document.fullscreenElement) {
        await player.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error(
        "Fullscreen error:",
        err
      );
    }

    revealControls();
  };

  // =======================================================
  // PICTURE IN PICTURE
  // =======================================================

  const handlePictureInPicture = async (
    event
  ) => {
    event.stopPropagation();

    if (youtubeVideo) {
      alert(
        "Picture in Picture is controlled by YouTube."
      );
      return;
    }

    const video = videoRef.current;

    if (!video) return;

    try {
      if (
        document.pictureInPictureElement
      ) {
        await document.exitPictureInPicture();
      } else if (
        document.pictureInPictureEnabled
      ) {
        await video.requestPictureInPicture();
      } else {
        alert(
          "Picture in Picture is not supported by your browser."
        );
      }
    } catch (err) {
      console.error(
        "Picture in Picture error:",
        err
      );

      alert(
        "Picture in Picture could not be started."
      );
    }

    setShowMoreMenu(false);
    setShowSpeedMenu(false);

    revealControls();
  };

  // =======================================================
  // DOWNLOAD VIDEO
  // =======================================================

  const handleDownload = async (event) => {
    event.stopPropagation();

    if (youtubeVideo) {
      alert(
        "Downloading YouTube videos is not available from Streamo."
      );

      setShowMoreMenu(false);
      return;
    }

    if (!currentVideo?.videoFile) {
      alert(
        "Video file is not available."
      );
      return;
    }

    const videoUrl =
      currentVideo.videoFile;

    const safeTitle =
      (
        currentVideo.title ||
        "video"
      )
        .replace(
          /[<>:"/\\|?*]+/g,
          ""
        )
        .trim() || "video";

    try {
      setShowMoreMenu(false);
      setShowSpeedMenu(false);

      const response = await fetch(
        videoUrl
      );

      if (!response.ok) {
        throw new Error(
          `Download request failed: ${response.status}`
        );
      }

      const blob =
        await response.blob();

      const blobUrl =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = blobUrl;
      link.download =
        `${safeTitle}.mp4`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(
          blobUrl
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Download failed:",
        error
      );

      const openVideo =
        window.confirm(
          "The server blocked direct downloading. Would you like to open the video file?"
        );

      if (openVideo) {
        window.open(
          videoUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }
    }
  };

  // =======================================================
  // PLAYBACK SPEED
  // =======================================================

  const changePlaybackSpeed = (
    speed
  ) => {
    if (youtubeVideo) {
      return;
    }

    if (!videoRef.current) return;

    videoRef.current.playbackRate =
      speed;

    setPlaybackRate(speed);
    setShowSpeedMenu(false);
    setShowMoreMenu(false);

    revealControls();
  };

  // =======================================================
  // SUBTITLES / CC
  // =======================================================

  const handleSubtitles = () => {
    if (youtubeVideo) {
      alert(
        "Subtitles are controlled by YouTube."
      );

      setShowMoreMenu(false);
      return;
    }

    const video = videoRef.current;

    if (!video) return;

    const tracks = video.textTracks;

    if (!tracks || tracks.length === 0) {
      alert(
        "This video does not have subtitles or captions."
      );

      setShowMoreMenu(false);
      return;
    }

    const firstTrack = tracks[0];

    if (
      firstTrack.mode ===
      "showing"
    ) {
      firstTrack.mode = "hidden";
    } else {
      Array.from(tracks).forEach(
        (track) => {
          track.mode = "hidden";
        }
      );

      firstTrack.mode = "showing";
    }

    setShowMoreMenu(false);
  };

  // =======================================================
  // TRANSCRIPT
  // =======================================================

  const handleTranscript = () => {
    setShowTranscript(
      (previous) => !previous
    );

    setShowMoreMenu(false);
    setShowSpeedMenu(false);
  };

  // =======================================================
  // STATS FOR NERDS
  // =======================================================

  const handleStats = () => {
    setShowStats(
      (previous) => !previous
    );

    setShowMoreMenu(false);
    setShowSpeedMenu(false);
  };

  // =======================================================
  // FORMAT PLAYER TIME
  // =======================================================

  const formatPlayerTime = (
    time = 0
  ) => {
    if (!Number.isFinite(time)) {
      return "0:00";
    }

    const totalSeconds =
      Math.floor(time);

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds =
      totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        seconds
      ).padStart(2, "0")}`;
    }

    return `${minutes}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // =======================================================
  // LIKE
  // =======================================================

  const handleLike = async () => {
    if (
      !currentVideo?._id ||
      likeLoading
    ) {
      return;
    }

    const previousLiked = isLiked;

    const previousLikeCount =
      likeCount;

    setIsLiked(!previousLiked);

    setLikeCount((count) =>
      previousLiked
        ? Math.max(0, count - 1)
        : count + 1
    );

    try {
      setLikeLoading(true);

      const response =
        await dispatch(
          likeVideo(
            currentVideo._id
          )
        ).unwrap();

      const data =
        response?.data ??
        response;

      if (
        typeof data?.likes ===
        "number"
      ) {
        setLikeCount(
          data.likes
        );
      }

      if (
        typeof data?.isLiked ===
        "boolean"
      ) {
        setIsLiked(
          data.isLiked
        );
      }
    } catch (error) {
      setIsLiked(
        previousLiked
      );

      setLikeCount(
        previousLikeCount
      );

      console.error(
        "Like/unlike failed:",
        error
      );
    } finally {
      setLikeLoading(false);
    }
  };

  // =======================================================
  // SHARE
  // =======================================================

  const handleShare = async () => {
    const shareUrl =
      window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            currentVideo.title,
          text:
            currentVideo.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        alert(
          "Video link copied to clipboard."
        );
      }
    } catch (error) {
      console.log(
        "Share cancelled or failed:",
        error
      );
    }
  };

  // =======================================================
  // SAVE
  // =======================================================

  const handleSave = () => {
    alert(
      "Save functionality will be connected to the backend."
    );
  };

  // =======================================================
  // VIEW + HISTORY
  // =======================================================

  useEffect(() => {
    if (!currentVideo?._id) return;

    dispatch(
      incrementVideoView(
        currentVideo._id
      )
    );

    dispatch(
      addToWatchHistory(
        currentVideo._id
      )
    );
  }, [
    dispatch,
    currentVideo?._id,
  ]);

  // =======================================================
  // CHANNEL
  // =======================================================

  const handleChannelClick = () => {
    const videoOwnerId =
      currentVideo?.owner?._id;

    if (!videoOwnerId) {
      console.error(
        "Owner username is missing"
      );

      return;
    }

    navigate(
      `/channel/${videoOwnerId}`
    );
  };

  // =======================================================
  // VIDEO SUBSCRIPTION
  // =======================================================

  const handleVideoSubscription =
    async () => {
      if (
        !currentVideo?._id ||
        subscribeLoading
      ) {
        return;
      }

      try {
        setSubscribeLoading(
          true
        );

        const response =
          await dispatch(
            toggleVideoSubscription(
              currentVideo._id
            )
          ).unwrap();

        const subscribed =
          response?.data
            ?.subscribed ??
          response?.subscribed;

        if (
          typeof subscribed ===
          "boolean"
        ) {
          setIsVideoSubscribed(
            subscribed
          );
        }
      } catch (error) {
        console.error(
          "Video subscription error:",
          error
        );
      } finally {
        setSubscribeLoading(
          false
        );
      }
    };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="watch-page">
        <main className="watch-container">
          <div className="watch-loading">
            <p>
              Loading video...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <div className="watch-page">
        <main className="watch-container">
          <div className="watch-error">
            <h2>
              Something went wrong
            </h2>

            <p>{error}</p>

            <button
              onClick={() =>
                dispatch(
                  fetchVideos()
                )
              }
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =======================================================
  // NOT FOUND
  // =======================================================

  if (!currentVideo) {
    return (
      <div className="watch-page">
        <main className="watch-container">
          <div className="watch-error">
            <h2>
              Video not found
            </h2>

            <p>
              This video may have been
              removed or is no longer
              available.
            </p>

            <button
              onClick={() =>
                navigate("/")
              }
            >
              Go Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =======================================================
  // DATA
  // =======================================================

  const channelName =
    currentVideo.owner?.fullName ||
    currentVideo.owner?.userName ||
    "Unknown creator";

  const channelUsername =
    currentVideo.owner?.userName ||
    "";

  const avatar =
    currentVideo.owner?.avatar ||
    "https://i.pravatar.cc/100?img=12";

  const views = formatViews(
    currentVideo.views
  );

  const timeAgo = formatTimeAgo(
    currentVideo.createdAt
  );

  const recommendedVideos =
    videos.filter(
      (video) =>
        video._id !==
        currentVideo._id
    );

  // =======================================================
  // JSX
  // =======================================================

  return (
    <div
      className={`watch-page ${
        isCinemaMode
          ? "cinema-mode"
          : ""
      }`}
    >
      <main className="watch-container">
        <div className="watch-layout">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <section className="main-video-section">

            {/* =================================================
                VIDEO PLAYER
            ================================================= */}

            <div
              ref={playerRef}
              className={`main-player ${
                isPlaying
                  ? "player-playing"
                  : "player-paused"
              } ${
                youtubeVideo
                  ? "youtube-player"
                  : ""
              }`}
              onMouseEnter={
                revealControls
              }
              onMouseMove={
                revealControls
              }
              onMouseLeave={() => {
                if (
                  isPlaying &&
                  !showMoreMenu
                ) {
                  if (
                    hideControlsTimer.current
                  ) {
                    clearTimeout(
                      hideControlsTimer.current
                    );
                  }

                  hideControlsTimer.current =
                    setTimeout(() => {
                      setShowControls(
                        false
                      );
                    }, 1200);
                }
              }}
            >

              {/* =================================================
                  YOUTUBE
              ================================================= */}

              {youtubeVideo &&
              youtubeId ? (
                <iframe
                  className="youtube-iframe"
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                  title={
                    currentVideo.title
                  }
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <>
                  {/* =================================================
                      CLOUDINARY / HTML5 VIDEO
                  ================================================= */}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    preload="metadata"
                    poster={
                      currentVideo.thumbnail
                    }
                    src={
                      currentVideo.videoFile
                    }
                    onClick={
                      handleVideoClick
                    }
                    onPlay={
                      handleVideoPlay
                    }
                    onPause={
                      handleVideoPause
                    }
                    onTimeUpdate={
                      handleTimeUpdate
                    }
                    onLoadedMetadata={
                      handleLoadedMetadata
                    }
                    onEnded={() => {
                      setIsPlaying(
                        false
                      );

                      setShowControls(
                        true
                      );
                    }}
                  >
                    Your browser does not
                    support the video element.
                  </video>

                  {/* =================================================
                      CENTER PLAY
                  ================================================= */}

                  {!isPlaying && (
                    <button
                      type="button"
                      className="center-play-button"
                      onClick={
                        togglePlay
                      }
                      aria-label="Play video"
                    >
                      <span className="play-icon">
                        ▶
                      </span>
                    </button>
                  )}

                  {/* =================================================
                      STATS FOR NERDS
                  ================================================= */}

                  {showStats && (
                    <div
                      className="stats-for-nerds"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
                      <div className="stats-title">
                        Stats for nerds
                      </div>

                      <div>
                        <strong>
                          Video ID:
                        </strong>{" "}
                        {currentVideo._id}
                      </div>

                      <div>
                        <strong>
                          Resolution:
                        </strong>{" "}
                        {videoRef.current
                          ?.videoWidth ||
                          0}
                        {" × "}
                        {videoRef.current
                          ?.videoHeight ||
                          0}
                      </div>

                      <div>
                        <strong>
                          Current time:
                        </strong>{" "}
                        {formatPlayerTime(
                          currentTime
                        )}
                      </div>

                      <div>
                        <strong>
                          Duration:
                        </strong>{" "}
                        {formatPlayerTime(
                          duration
                        )}
                      </div>

                      <div>
                        <strong>
                          Playback speed:
                        </strong>{" "}
                        {playbackRate}x
                      </div>

                      <div>
                        <strong>
                          Volume:
                        </strong>{" "}
                        {Math.round(
                          volume * 100
                        )}
                        %
                      </div>

                      <div>
                        <strong>
                          Network:
                        </strong>{" "}
                        {navigator.onLine
                          ? "Online"
                          : "Offline"}
                      </div>

                      <div>
                        <strong>
                          Player:
                        </strong>{" "}
                        HTML5 Video
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowStats(
                            false
                          )
                        }
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {/* =================================================
                      TRANSCRIPT
                  ================================================= */}

                  {showTranscript && (
                    <div
                      className="video-transcript-panel"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
                      <div className="transcript-header">
                        <strong>
                          Transcript
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            setShowTranscript(
                              false
                            )
                          }
                        >
                          ×
                        </button>
                      </div>

                      <div className="transcript-content">
                        {currentVideo.transcript ? (
                          <p>
                            {
                              currentVideo.transcript
                            }
                          </p>
                        ) : (
                          <p>
                            Transcript is not
                            available for this
                            video.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      THREE DOT MENU
                  ================================================= */}

                  <div
                    ref={
                      playerMoreMenuRef
                    }
                    className={`player-more-menu ${
                      showMoreMenu
                        ? "menu-open"
                        : ""
                    }`}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    {showMoreMenu && (
                      <div className="player-menu-panel">

                        {!showSpeedMenu ? (
                          <>
                            {/* PLAYBACK SPEED */}

                            <button
                              type="button"
                              className="player-menu-item"
                              onClick={() =>
                                setShowSpeedMenu(
                                  true
                                )
                              }
                            >
                              <span className="menu-icon">
                                ⚙
                              </span>

                              <span>
                                Playback speed
                              </span>

                              <span className="menu-value">
                                {playbackRate ===
                                1
                                  ? "Normal"
                                  : `${playbackRate}x`}
                              </span>

                              <span className="menu-arrow">
                                ›
                              </span>
                            </button>

                            {/* PICTURE IN PICTURE */}

                            <button
                              type="button"
                              className="player-menu-item"
                              onClick={
                                handlePictureInPicture
                              }
                            >
                              <span className="menu-icon">
                                ▣
                              </span>

                              <span>
                                Picture in Picture
                              </span>
                            </button>

                            {/* DOWNLOAD */}

                            <button
                              type="button"
                              className="player-menu-item"
                              onClick={
                                handleDownload
                              }
                            >
                              <span className="menu-icon">
                                ↓
                              </span>

                              <span>
                                Download
                              </span>
                            </button>

                            {/* SUBTITLES */}

                            <button
                              type="button"
                              className="player-menu-item"
                              onClick={
                                handleSubtitles
                              }
                            >
                              <span className="menu-icon">
                                CC
                              </span>

                              <span>
                                Subtitles/CC
                              </span>
                            </button>

                            {/* TRANSCRIPT */}

                            <button
                              type="button"
                              className="player-menu-item"
                              onClick={
                                handleTranscript
                              }
                            >
                              <span className="menu-icon">
                                ≡
                              </span>

                              <span>
                                Show transcript
                              </span>
                            </button>

                            {/* STATS */}

                            <button
                              type="button"
                              className="player-menu-item"
                              onClick={
                                handleStats
                              }
                            >
                              <span className="menu-icon">
                                ⓘ
                              </span>

                              <span>
                                Stats for nerds
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            {/* PLAYBACK SPEED SUBMENU */}

                            <div className="speed-menu-header">
                              <button
                                type="button"
                                className="speed-back-button"
                                onClick={() =>
                                  setShowSpeedMenu(
                                    false
                                  )
                                }
                              >
                                ‹
                              </button>

                              <span>
                                Playback speed
                              </span>
                            </div>

                            {[
                              0.25,
                              0.5,
                              0.75,
                              1,
                              1.25,
                              1.5,
                              1.75,
                              2,
                            ].map(
                              (speed) => (
                                <button
                                  type="button"
                                  key={speed}
                                  className={`player-menu-item speed-option ${
                                    playbackRate ===
                                    speed
                                      ? "selected-speed"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    changePlaybackSpeed(
                                      speed
                                    )
                                  }
                                >
                                  <span>
                                    {speed ===
                                    1
                                      ? "Normal"
                                      : `${speed}x`}
                                  </span>

                                  {playbackRate ===
                                    speed && (
                                    <span className="speed-check">
                                      ✓
                                    </span>
                                  )}
                                </button>
                              )
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* =================================================
                      CONTROL BAR
                  ================================================= */}

                  <div
                    className={`video-control-bar ${
                      showControls ||
                      !isPlaying
                        ? "controls-visible"
                        : "controls-hidden"
                    }`}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >

                    {/* PROGRESS */}

                    <div className="video-progress-wrapper">
                      <input
                        type="range"
                        className="video-progress"
                        min="0"
                        max={
                          duration || 0
                        }
                        step="0.1"
                        value={
                          currentTime
                        }
                        onChange={
                          handleSeek
                        }
                        style={{
                          "--progress":
                            duration > 0
                              ? `${
                                  (currentTime /
                                    duration) *
                                  100
                                }%`
                              : "0%",
                        }}
                        aria-label="Video progress"
                      />
                    </div>

                    <div className="control-row">

                      {/* PLAY */}

                      <button
                        type="button"
                        className="player-control"
                        onClick={
                          togglePlay
                        }
                        aria-label={
                          isPlaying
                            ? "Pause video"
                            : "Play video"
                        }
                      >
                        {isPlaying
                          ? "❚❚"
                          : "▶"}
                      </button>

                      {/* VOLUME */}

                      <div className="volume-control">
                        <button
                          type="button"
                          className="player-control"
                          onClick={
                            toggleMute
                          }
                          aria-label={
                            isMuted
                              ? "Unmute"
                              : "Mute"
                          }
                        >
                          {isMuted ||
                          volume ===
                            0
                            ? "🔇"
                            : volume <
                              0.5
                            ? "🔉"
                            : "🔊"}
                        </button>

                        <input
                          type="range"
                          className="volume-slider"
                          min="0"
                          max="1"
                          step="0.01"
                          value={
                            isMuted
                              ? 0
                              : volume
                          }
                          onChange={
                            handleVolumeChange
                          }
                          aria-label="Volume"
                        />
                      </div>

                      {/* TIME */}

                      <div className="player-time">
                        <span>
                          {formatPlayerTime(
                            currentTime
                          )}
                        </span>

                        <span className="time-separator">
                          /
                        </span>

                        <span>
                          {formatPlayerTime(
                            duration
                          )}
                        </span>
                      </div>

                      <div className="player-spacer" />

                      {/* CINEMA */}

                      <button
                        type="button"
                        className={`player-control ${
                          isCinemaMode
                            ? "cinema-active"
                            : ""
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();

                          setIsCinemaMode(
                            (previous) =>
                              !previous
                          );

                          revealControls();
                        }}
                        title={
                          isCinemaMode
                            ? "Exit cinema mode"
                            : "Cinema mode"
                        }
                        aria-label="Cinema mode"
                      >
                        {isCinemaMode
                          ? "▣"
                          : "▭"}
                      </button>

                      {/* THREE DOT */}

                      <button
                        type="button"
                        className={`player-control more-control ${
                          showMoreMenu
                            ? "more-active"
                            : ""
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();

                          setShowMoreMenu(
                            (previous) =>
                              !previous
                          );

                          setShowSpeedMenu(
                            false
                          );

                          setShowControls(
                            true
                          );
                        }}
                        title="More options"
                        aria-label="More options"
                      >
                        ⋮
                      </button>

                      {/* FULLSCREEN */}

                      <button
                        type="button"
                        className="player-control"
                        onClick={
                          toggleFullscreen
                        }
                        title="Fullscreen"
                        aria-label="Fullscreen"
                      >
                        ⛶
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <h1 className="watch-title">
              {currentVideo.title}
            </h1>

            {/* =================================================
                META
            ================================================= */}

            <div className="watch-meta">
              <span>{views}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>

            {/* =================================================
                CHANNEL + ACTIONS
            ================================================= */}

            <div className="video-actions-row">

              <div className="channel-info">

                <button
                  type="button"
                  className="channel-avatar-button"
                  onClick={
                    handleChannelClick
                  }
                >
                  <img
                    src={avatar}
                    alt={channelName}
                  />
                </button>

                <div
                  className="channel-details"
                  onClick={
                    handleChannelClick
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      handleChannelClick();
                    }
                  }}
                >
                  <h3>
                    {channelName}
                  </h3>

                  <p>
                    {channelUsername
                      ? `@${channelUsername}`
                      : "Creator"}
                  </p>
                </div>

                <button
                  type="button"
                  className={`subscribe-btn ${
                    isVideoSubscribed
                      ? "subscribed"
                      : ""
                  }`}
                  disabled={
                    subscribeLoading
                  }
                  onClick={
                    handleVideoSubscription
                  }
                >
                  {subscribeLoading
                    ? "..."
                    : isVideoSubscribed
                    ? "Subscribed"
                    : "Subscribe"}
                </button>
              </div>

              <div className="action-buttons">

                {/* LIKE */}

                <button
                  type="button"
                  className={`action-btn ${
                    isLiked
                      ? "active-action"
                      : ""
                  }`}
                  onClick={
                    handleLike
                  }
                  disabled={
                    likeLoading
                  }
                  aria-pressed={
                    isLiked
                  }
                  aria-label={
                    isLiked
                      ? "Unlike video"
                      : "Like video"
                  }
                >
                  <span>
                    {isLiked
                      ? "♥"
                      : "♡"}
                  </span>

                  {likeCount}
                </button>

                {/* SHARE */}

                <button
                  className="action-btn"
                  onClick={
                    handleShare
                  }
                >
                  <span>↗</span>
                  Share
                </button>

                {/* SAVE */}

                <button
                  className="action-btn"
                  onClick={
                    handleSave
                  }
                >
                  <span>＋</span>
                  Save
                </button>

                {/* MORE */}

                <button
                  className="action-btn"
                  onClick={() =>
                    alert(
                      "More video actions will be connected later."
                    )
                  }
                >
                  ⋯
                </button>
              </div>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="video-description">

              <div className="description-stats">
                <span>{views}</span>
                <span>•</span>
                <span>{timeAgo}</span>
              </div>

              <p>
                {currentVideo.description ||
                  "No description available."}
              </p>

              <button className="show-more">
                Show more
              </button>
            </div>

            {/* =================================================
                COMMENTS
            ================================================= */}

            <div className="comments-section">

              <div className="comments-heading">
                <h2>
                  Comments
                </h2>

                <span>0</span>
              </div>

              <div className="comment-box">

                <div className="comment-avatar">
                  👤
                </div>

                <input
                  type="text"
                  placeholder="Add a comment..."
                />
              </div>

              <div className="comment">

                <div className="comment-avatar">
                  👨
                </div>

                <div className="comment-content">

                  <strong>
                    Comments coming soon
                  </strong>

                  <span>
                    Streamo
                  </span>

                  <p>
                    Comment functionality
                    will be connected to
                    the backend later.
                  </p>

                  <div className="comment-actions">
                    <button>
                      ♡ 0
                    </button>

                    <button>
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              RECOMMENDATIONS
          ================================================= */}

          <aside className="recommendations">

            <div className="recommendation-header">
              <h2>
                Up next
              </h2>
            </div>

            <div className="recommendation-categories">

              <button className="active">
                All
              </button>

              <button>
                Related
              </button>

              <button>
                Node.js
              </button>

              <button>
                React
              </button>

              <button>
                New
              </button>
            </div>

            {recommendedVideos.map(
              (video) => {
                const recommendedChannel =
                  video.owner?.fullName ||
                  video.owner?.userName ||
                  "Unknown creator";

                return (
                  <Link
                    to={`/watch/${video._id}`}
                    className="recommended-card"
                    key={video._id}
                  >
                    <div className="recommended-thumbnail">

                      <img
                        src={
                          video.thumbnail
                        }
                        alt={
                          video.title
                        }
                      />

                      <span>
                        {formatDuration(
                          video.duration
                        )}
                      </span>
                    </div>

                    <div className="recommended-info">

                      <h3>
                        {video.title}
                      </h3>

                      <p>
                        {
                          recommendedChannel
                        }
                      </p>

                      <p>
                        {formatViews(
                          video.views
                        )}
                        {" • "}
                        {formatTimeAgo(
                          video.createdAt
                        )}
                      </p>
                    </div>
                  </Link>
                );
              }
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default VideoCard;