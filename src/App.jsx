import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import PublishVideo from "./components/pages/PublishVideo";
import { getCurrentUser } from "./redux/slices/authSlice";
import Navbar from "./components/Navbar";
import Home from "./components/pages/Home";
import LoginSignup from "./components/pages/LoginSignup";
import RegisterUser from "./components/pages/RegisterUser";
import VideoCard from "./components/pages/VideoCard";
import WatchHistory from "./components/pages/WatchHistory";
import Search from "./components/pages/Search";
import Profile from "./components/pages/Profile";
import ChannelProfile from "./components/pages/ChannelProfile";
import Reel from "./components/pages/reel";
function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  const hideNavbar = location.pathname === "/";

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <>
       <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginSignup />} />

        <Route path="/register" element={<RegisterUser />} />

        <Route path="/watch/:id" element={<VideoCard />} />

        <Route path="/watch-history" element={<WatchHistory />} />

        <Route path="/search" element={<Search />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/channel/:username" element={<ChannelProfile />} />
        <Route path="/publish-video" element={<PublishVideo />} />
        <Route path="/reel" element={<Reel />} />
      </Routes>
    </>
  );
}

export default App;
