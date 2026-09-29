import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { logoutUser } from "../redux/slices/authSlice";

import "./Navbar.css";

/* =========================================================
   ICONS
========================================================= */

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function SeriesIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.6Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
    </svg>
  );
}

/* =========================================================
   LOGIN ICON
========================================================= */

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M14 7l5 5-5 5" />
      <path d="M19 12H7" />
      <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" />
    </svg>
  );
}

/* =========================================================
   LOGOUT ICON
========================================================= */

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </svg>
  );
}

/* =========================================================
   LOGO
========================================================= */

function LogoIcon() {
  return (
    <div className="brand-icon">
      <div className="brand-screen">
        <span />
      </div>
    </div>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  /* =======================================================
     NAVIGATION
  ======================================================= */

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
      label: "Publish Video",
      path: "/publish-video",
      icon: <BellIcon />,
    },
    {
      label: "Reel",
      path: "/reel",
      icon: <SeriesIcon />,
    },
    {
      label: "Watch history",
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

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* =======================================================
     PROFILE DATA
  ======================================================= */

  const profileName =
    user?.fullName ||
    user?.userName ||
    user?.username ||
    "Profile";

  const profileAvatar =
    user?.avatar ||
    user?.avatarUrl ||
    user?.profileImage ||
    "";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <aside className="sidebar">

      {/* =================================================
          BRAND
      ================================================= */}

      <Link
        to="/"
        className="brand"
        aria-label="Streamo Home"
      >
        <LogoIcon />

        <span className="brand-text">
          Streamo
        </span>
      </Link>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav
        className="sidebar-nav"
        aria-label="Main navigation"
      >
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            title={item.label}
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span className="nav-label">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* =================================================
          ACCOUNT
      ================================================= */}

      <div className="sidebar-profile">

        {user ? (
          <>

            {/* =========================================
                PROFILE
            ========================================= */}

            <Link
              to="/profile"
              className="profile-link"
              title={profileName}
            >

              <div className="profile-avatar-wrapper">

                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt={profileName}
                  />
                ) : (
                  <div className="profile-avatar-fallback">
                    {profileName
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <span
                  className="online-dot"
                  aria-hidden="true"
                />

              </div>

              <div className="profile-info">

                <span className="profile-name">
                  {profileName}
                </span>

                <span className="profile-status">
                  Online
                </span>

              </div>

            </Link>

            {/* =========================================
                LOGOUT
            ========================================= */}

            <button
              type="button"
              className="sidebar-logout"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >

              <LogoutIcon />

              <span>Logout</span>

            </button>

          </>
        ) : (

          /* ===========================================
             LOGIN
          =========================================== */

          <Link
            to="/login"
            className="sidebar-login"
            title="Login"
          >

            <LoginIcon />

            <span>Login</span>

          </Link>

        )}

      </div>

    </aside>
  );
}

export default Navbar;