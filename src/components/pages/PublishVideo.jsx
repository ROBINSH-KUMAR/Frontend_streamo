
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { publishVideo } from "../../redux/slices/videoSlice";
import "./PublishVideo.css";

function PublishVideo() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

const { uploading} = useSelector(
  (state) => state.videos
);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [thumbnailFilter, setThumbnailFilter] = useState("normal");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     VIDEO PREVIEW
  ========================================================= */

  useEffect(() => {
    if (!videoFile) {
      setVideoPreview("");
      return;
    }

    const url = URL.createObjectURL(videoFile);
    setVideoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  /* =========================================================
     THUMBNAIL PREVIEW
  ========================================================= */

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return;
    }

    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  /* =========================================================
     VIDEO SELECT
  ========================================================= */

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    const maxSize = 500 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Video size must be less than 500MB.");
      return;
    }

    setVideoFile(file);
  };

  /* =========================================================
     THUMBNAIL SELECT
  ========================================================= */

  const handleThumbnailChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Thumbnail size must be less than 10MB.");
      return;
    }

    setThumbnailFile(file);
  };

  /* =========================================================
     REMOVE VIDEO
  ========================================================= */

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     REMOVE THUMBNAIL
  ========================================================= */

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    setThumbnailFilter("normal");

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!title.trim()) {
      setError("Please enter a video title.");
      return false;
    }

    if (title.trim().length < 3) {
      setError("Title must contain at least 3 characters.");
      return false;
    }

    if (!description.trim()) {
      setError("Please enter a video description.");
      return false;
    }

    if (!videoFile) {
      setError("Please select a video.");
      return false;
    }

    if (!thumbnailFile) {
      setError("Please select a thumbnail.");
      return false;
    }

    return true;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("video", videoFile);
    formData.append("thumbnail", thumbnailFile);

    try {
      await dispatch(publishVideo(formData)).unwrap();

      setSuccess("Video published successfully.");

      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview("");
      setThumbnailPreview("");
      setThumbnailFilter("normal");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError(
        err?.message ||
          err?.data?.message ||
          "Something went wrong while publishing the video."
      );
    }
  };

  /* =========================================================
     FILE SIZE
  ========================================================= */

  const formatFileSize = (size) => {
    if (!size) return "";

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="publish-page">
      <div className="publish-container">

        {/* HEADER */}

        <div className="publish-header">
          <div>
            <span className="publish-eyebrow">CREATOR STUDIO</span>

            <h1>Publish your video</h1>

            <p>
              Add your video, choose a thumbnail and give your audience
              something worth watching.
            </p>
          </div>
        </div>

        {/* ALERT */}

        {error && (
          <div className="publish-alert publish-error">
            <span>!</span>
            {error}
          </div>
        )}

        {success && (
          <div className="publish-alert publish-success">
            <span>✓</span>
            {success}
          </div>
        )}

        <form
          className="publish-layout"
          onSubmit={handleSubmit}
        >

          {/* =====================================================
              LEFT
          ====================================================== */}

          <section className="publish-main">

            {/* VIDEO */}

            <div className="publish-card">
              <div className="card-heading">
                <div>
                  <h2>Video</h2>
                  <p>Upload the video you want to publish.</p>
                </div>

                <span className="required-badge">
                  Required
                </span>
              </div>

              {!videoPreview ? (
                <button
                  type="button"
                  className="upload-zone video-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="upload-icon">
                    ▶
                  </div>

                  <strong>Choose a video</strong>

                  <span>
                    MP4, WebM, MOV or other supported formats
                  </span>

                  <small>
                    Maximum file size: 500MB
                  </small>
                </button>
              ) : (
                <div className="video-preview-wrapper">

                  <video
                    className="video-preview"
                    src={videoPreview}
                    controls
                  />

                  <div className="preview-footer">
                    <div className="file-details">
                      <strong>{videoFile?.name}</strong>

                      <span>
                        {formatFileSize(videoFile?.size)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={removeVideo}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={handleVideoChange}
              />
            </div>

            {/* THUMBNAIL */}

            <div className="publish-card">
              <div className="card-heading">
                <div>
                  <h2>Thumbnail</h2>
                  <p>
                    Choose an image that represents your video.
                  </p>
                </div>

                <span className="required-badge">
                  Required
                </span>
              </div>

              {!thumbnailPreview ? (
                <button
                  type="button"
                  className="upload-zone thumbnail-upload-zone"
                  onClick={() =>
                    thumbnailInputRef.current?.click()
                  }
                >
                  <div className="upload-icon">
                    ◫
                  </div>

                  <strong>Choose a thumbnail</strong>

                  <span>
                    JPG, PNG or WebP
                  </span>

                  <small>
                    Maximum file size: 10MB
                  </small>
                </button>
              ) : (
                <div className="thumbnail-editor">

                  <div className="thumbnail-preview-wrapper">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className={`thumbnail-preview filter-${thumbnailFilter}`}
                    />
                  </div>

                  <div className="thumbnail-tools">

                    <div>
                      <h3>Thumbnail preview</h3>

                      <p>
                        Preview how your thumbnail will look.
                      </p>
                    </div>

                    <div className="filter-row">
                      <button
                        type="button"
                        className={
                          thumbnailFilter === "normal"
                            ? "filter-button active"
                            : "filter-button"
                        }
                        onClick={() =>
                          setThumbnailFilter("normal")
                        }
                      >
                        Normal
                      </button>

                      <button
                        type="button"
                        className={
                          thumbnailFilter === "contrast"
                            ? "filter-button active"
                            : "filter-button"
                        }
                        onClick={() =>
                          setThumbnailFilter("contrast")
                        }
                      >
                        Contrast
                      </button>

                      <button
                        type="button"
                        className={
                          thumbnailFilter === "bright"
                            ? "filter-button active"
                            : "filter-button"
                        }
                        onClick={() =>
                          setThumbnailFilter("bright")
                        }
                      >
                        Bright
                      </button>

                      <button
                        type="button"
                        className={
                          thumbnailFilter === "cinematic"
                            ? "filter-button active"
                            : "filter-button"
                        }
                        onClick={() =>
                          setThumbnailFilter("cinematic")
                        }
                      >
                        Cinematic
                      </button>
                    </div>

                    <div className="thumbnail-file-row">
                      <div className="file-details">
                        <strong>
                          {thumbnailFile?.name}
                        </strong>

                        <span>
                          {formatFileSize(thumbnailFile?.size)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="remove-button"
                        onClick={removeThumbnail}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleThumbnailChange}
              />
            </div>

            {/* DETAILS */}

            <div className="publish-card">

              <div className="card-heading">
                <div>
                  <h2>Video details</h2>
                  <p>
                    Give your video a title and description.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="video-title">
                    Title
                  </label>

                  <span>
                    {title.length}/100
                  </span>
                </div>

                <input
                  id="video-title"
                  type="text"
                  value={title}
                  maxLength={100}
                  placeholder="Give your video a title"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="video-description">
                    Description
                  </label>

                  <span>
                    {description.length}/1000
                  </span>
                </div>

                <textarea
                  id="video-description"
                  value={description}
                  maxLength={1000}
                  rows={7}
                  placeholder="Tell viewers what your video is about..."
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />
              </div>

            </div>
          </section>

          {/* =====================================================
              RIGHT
          ====================================================== */}

          <aside className="publish-sidebar">

            <div className="publish-card publish-summary">

              <div className="summary-heading">
                <h2>Publish</h2>

                <span className="draft-status">
                  Draft
                </span>
              </div>

              <div className="summary-preview">

                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Video thumbnail"
                    className={`summary-thumbnail filter-${thumbnailFilter}`}
                  />
                ) : (
                  <div className="summary-placeholder">
                    <span>▶</span>
                    <small>No thumbnail</small>
                  </div>
                )}

                <div className="summary-overlay">
                  <span>
                    {title || "Your video title"}
                  </span>
                </div>

              </div>

              <div className="summary-info">

                <div className="summary-row">
                  <span>Video</span>

                  <strong>
                    {videoFile ? "Ready" : "Missing"}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>Thumbnail</span>

                  <strong>
                    {thumbnailFile ? "Ready" : "Missing"}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>Title</span>

                  <strong>
                    {title ? "Added" : "Missing"}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>Description</span>

                  <strong>
                    {description ? "Added" : "Missing"}
                  </strong>
                </div>

              </div>

              <button
                type="submit"
                className="publish-button"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="button-spinner"></span>
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish video
                    <span>→</span>
                  </>
                )}
              </button>

              <p className="publish-note">
                Your video will be uploaded and published
                immediately.
              </p>

            </div>

          </aside>
        </form>
      </div>
    </main>
  );
}

export default PublishVideo;
