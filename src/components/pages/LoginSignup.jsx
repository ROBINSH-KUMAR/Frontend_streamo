
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./Auth.css";

import { loginUser } from "../../redux/slices/authSlice";

function LoginSignup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { loading, error: reduxError } = useSelector(
    (state) => state.auth
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const identifier = formData.identifier.trim();

    if (!identifier) {
      setError("Please enter your email or username.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      const credentials = {
        password: formData.password,
      };

      /*
       * Backend accepts either:
       * email
       * OR
       * userName
       */

      if (identifier.includes("@")) {
        credentials.email = identifier;
      } else {
        credentials.userName = identifier;
      }

      const result = await dispatch(
        loginUser(credentials)
      );

      if (loginUser.fulfilled.match(result)) {
        navigate("/");
      } else {
        setError(
          result.payload ||
            "Unable to login. Please check your credentials."
        );
      }
    } catch (error) {
      setError(
        error?.message ||
          "Unable to login. Please check your credentials."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <div className="auth-logo-screen">
              <span />
            </div>
          </div>

          <span>Streamo</span>
        </Link>

        {/* Heading */}
        <div className="auth-heading">
          <h1>Welcome back</h1>
          <p>
            Sign in to continue watching your videos.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="input-group">
            <label>Email or Username</label>

            <input
              type="text"
              name="identifier"
              placeholder="Enter your email or username"
              value={formData.identifier}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {(error || reduxError) && (
            <div className="auth-message error">
              {error || reduxError}
            </div>
          )}

          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Register */}
        <div className="auth-switch">
          <span>Don't have an account?</span>

          <Link to="/register">
            Create account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default LoginSignup;
