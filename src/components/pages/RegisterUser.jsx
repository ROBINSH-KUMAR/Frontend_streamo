
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../api/axios"; // Import the configured axios instance

import "./RegisterUser.css";

const RegisterUser = () => {
  const navigate = useNavigate();

  const avatarRef = useRef(null);
  const coverImageRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event, setPreview, fieldName) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "Only JPG, JPEG, PNG or WEBP images are allowed",
      }));

      event.target.value = "";
      setPreview(null);

      return;
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    setPreview(URL.createObjectURL(file));
  };

  const validateForm = (formData) => {
    const newErrors = {};

    const fullName = formData.get("fullName")?.trim();
    const userName = formData.get("userName")?.trim();
    const email = formData.get("email")?.trim();
    const password = formData.get("password");
    const avatar = formData.get("avatar");

    if (!fullName) {
      newErrors.fullName = "Full name is required";
    }

    if (!userName) {
      newErrors.userName = "Username is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!avatar || avatar.size === 0) {
      newErrors.avatar = "Profile picture is required";
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrors({});

    const formData = new FormData(event.target);

    // Validate form
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      /*
        Backend expects:

        POST /register

        multipart/form-data:
        - fullName
        - userName
        - email
        - password
        - avatar
        - coverImage
      */

     const response = await api.post("/register", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

      console.log("Registration successful:", response.data);

      // Registration completed
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      setErrors({
        general:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* LEFT SIDE */}
        <div className="register-left">
          <Link to="/" className="register-logo">
            <div className="register-logo-icon">
              <div className="register-logo-screen">
                <span></span>
              </div>
            </div>

            <span>Streamo</span>
          </Link>

          <div className="register-intro">
            <span className="register-tag">CREATE • SHARE • WATCH</span>

            <h1>
              Share your world
              <br />
              with <span>Streamo.</span>
            </h1>

            <p>
              Create your account and start sharing your videos with the world.
            </p>

            <div className="register-features">
              <div>
                <span className="feature-icon">▶</span>

                <div>
                  <strong>Upload videos</strong>
                  <small>Share your stories with everyone.</small>
                </div>
              </div>

              <div>
                <span className="feature-icon">✦</span>

                <div>
                  <strong>Build your profile</strong>
                  <small>Create your own space on Streamo.</small>
                </div>
              </div>

              <div>
                <span className="feature-icon">◉</span>

                <div>
                  <strong>Watch & discover</strong>
                  <small>Explore videos from other creators.</small>
                </div>
              </div>
            </div>
          </div>

          <div className="register-left-footer">
            <span>© 2026 Streamo</span>
            <span>Start creating today.</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="register-right">
          <div className="register-heading">
            <h2>Create account</h2>
            <p>Join Streamo and start sharing your story.</p>
          </div>

          {errors.general && (
            <div className="register-general-error">
              {errors.general}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="register-form"
          >
            {/* FULL NAME + USERNAME */}
            <div className="register-input-row">
              <div className="register-form-group">
                <label>Full name</label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                />

                {errors.fullName && <small>{errors.fullName}</small>}
              </div>

              <div className="register-form-group">
                <label>Username</label>

                <input
                  type="text"
                  name="userName"
                  placeholder="@username"
                />

                {errors.userName && <small>{errors.userName}</small>}
              </div>
            </div>

            {/* EMAIL */}
            <div className="register-form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
              />

              {errors.email && <small>{errors.email}</small>}
            </div>

            {/* PASSWORD */}
            <div className="register-form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
              />

              {errors.password && <small>{errors.password}</small>}
            </div>

            {/* PROFILE PICTURE */}
            <div className="register-form-group">
              <label className="upload-title">Profile picture</label>

              <div className="profile-upload">
                <div className="profile-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile preview" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>

                <div className="upload-info">
                  <strong>
                    {avatarPreview
                      ? "Profile picture selected"
                      : "Add profile picture"}
                  </strong>

                  <small>JPG, JPEG, PNG or WEBP</small>

                  <button
                    type="button"
                    className="choose-image-btn"
                    onClick={() => avatarRef.current?.click()}
                  >
                    Choose image
                  </button>
                </div>
              </div>

              <input
                ref={avatarRef}
                type="file"
                name="avatar"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                hidden
                onChange={(event) =>
                  handleImageChange(
                    event,
                    setAvatarPreview,
                    "avatar"
                  )
                }
              />

              {errors.avatar && (
                <small className="upload-error">
                  {errors.avatar}
                </small>
              )}
            </div>

            {/* COVER IMAGE */}
            <div className="register-form-group">
              <label className="upload-title">Cover image</label>

              <div className="cover-upload">
                <div className="cover-preview">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" />
                  ) : (
                    <div className="cover-placeholder">
                      <span>▧</span>
                      <small>Add a cover image</small>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="choose-cover-btn"
                  onClick={() => coverImageRef.current?.click()}
                >
                  Choose cover
                </button>
              </div>

              <input
                ref={coverImageRef}
                type="file"
                name="coverImage"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                hidden
                onChange={(event) =>
                  handleImageChange(
                    event,
                    setCoverPreview,
                    "coverImage"
                  )
                }
              />

              {errors.coverImage && (
                <small className="upload-error">
                  {errors.coverImage}
                </small>
              )}
            </div>

            {/* SUBMIT */}
            <button
              className="register-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}

              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="register-login">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>

          <div className="register-footer">
            Your journey starts here 🚀
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
