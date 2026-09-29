
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Search.css";

const videos = [
  {
    id: 1,
    title: "The Life Lessons Nobody Teaches You",
    description:
      "Important life lessons about growth, discipline and becoming a better version of yourself.",
    thumbnail: "https://picsum.photos/seed/life/640/360",
    duration: "12:45",
    channel: "Mindset Talks",
    views: "1.2M views",
    time: "2 days ago",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: 2,
    title: "Build a Full Stack App With React",
    description:
      "Learn how to build a modern full-stack application using React and Node.js.",
    thumbnail: "https://picsum.photos/seed/react/640/360",
    duration: "18:32",
    channel: "Code With Me",
    views: "845K views",
    time: "5 days ago",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
  {
    id: 3,
    title: "What Nobody Tells You About Success",
    description:
      "Success is rarely as simple as people make it look. Here are some things you should know.",
    thumbnail: "https://picsum.photos/seed/success/640/360",
    duration: "10:21",
    channel: "Daily Wisdom",
    views: "2.4M views",
    time: "1 week ago",
    avatar: "https://i.pravatar.cc/100?img=13",
  },
  {
    id: 4,
    title: "Node.js Backend Project From Scratch",
    description:
      "Build a Node.js backend from scratch and understand how everything works together.",
    thumbnail: "https://picsum.photos/seed/node/640/360",
    duration: "24:16",
    channel: "Backend Academy",
    views: "432K views",
    time: "3 days ago",
    avatar: "https://i.pravatar.cc/100?img=14",
  },
  {
    id: 5,
    title: "A Journey Through Beautiful Places",
    description:
      "Join us on a journey through some beautiful and unforgettable places.",
    thumbnail: "https://picsum.photos/seed/travel/640/360",
    duration: "15:48",
    channel: "Travel Stories",
    views: "3.1M views",
    time: "4 days ago",
    avatar: "https://i.pravatar.cc/100?img=15",
  },
  {
    id: 6,
    title: "How I Improved My Coding Skills",
    description:
      "A practical look at how consistent practice can improve your programming skills.",
    thumbnail: "https://picsum.photos/seed/coding/640/360",
    duration: "11:05",
    channel: "Developer Life",
    views: "678K views",
    time: "1 month ago",
    avatar: "https://i.pravatar.cc/100?img=16",
  },
  {
    id: 7,
    title: "The Psychology Behind Human Behavior",
    description:
      "Understanding the psychology behind everyday human behavior.",
    thumbnail: "https://picsum.photos/seed/psychology/640/360",
    duration: "21:34",
    channel: "Think Deep",
    views: "956K views",
    time: "6 days ago",
    avatar: "https://i.pravatar.cc/100?img=17",
  },
  {
    id: 8,
    title: "Learn JavaScript From Zero",
    description:
      "A practical JavaScript guide covering the concepts every beginner should understand.",
    thumbnail: "https://picsum.photos/seed/javascript/640/360",
    duration: "16:42",
    channel: "Code Academy",
    views: "1.8M views",
    time: "1 week ago",
    avatar: "https://i.pravatar.cc/100?img=18",
  },
];

function Search() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const filteredVideos = videos.filter((video) => {
    const value = query.toLowerCase().trim();

    if (!value) return true;

    return (
      video.title.toLowerCase().includes(value) ||
      video.channel.toLowerCase().includes(value) ||
      video.description.toLowerCase().includes(value)
    );
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <div className="search-page">
      <main className="search-container">

        {/* SEARCH HEADER */}
        <section className="search-header">
          <h1>Search</h1>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <span className="search-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </span>

              <input
                type="text"
                placeholder="Search videos, channels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => {
                    setSearch("");
                    setQuery("");
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </section>

        {/* SEARCH RESULT INFO */}
        {query && (
          <div className="search-result-info">
            <h2>
              Results for <span>"{query}"</span>
            </h2>

            <p>
              {filteredVideos.length}{" "}
              {filteredVideos.length === 1 ? "video" : "videos"} found
            </p>
          </div>
        )}

        {/* RESULTS */}
        {filteredVideos.length > 0 ? (
          <section className="search-results">

            {filteredVideos.map((video) => (
              <Link
                to={`/watch/${video.id}`}
                className="search-video-link"
                key={video.id}
              >
                <article className="search-video-card">

                  {/* THUMBNAIL */}
                  <div className="search-thumbnail">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                    />

                    <span className="search-duration">
                      {video.duration}
                    </span>

                    <div className="search-play">
                      <svg viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* VIDEO INFO */}
                  <div className="search-video-info">

                    <div className="search-avatar">
                      <img
                        src={video.avatar}
                        alt={video.channel}
                      />
                    </div>

                    <div className="search-video-details">
                      <h3>{video.title}</h3>

                      <p className="search-channel">
                        {video.channel}
                      </p>

                      <p className="search-meta">
                        {video.views} • {video.time}
                      </p>

                      <p className="search-description">
                        {video.description}
                      </p>
                    </div>

                  </div>

                </article>
              </Link>
            ))}

          </section>
        ) : (
          /* EMPTY STATE */
          <section className="search-empty">
            <div className="empty-search-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </div>

            <h2>No videos found</h2>

            <p>
              We couldn't find anything matching "{query}".
            </p>

            <button
              onClick={() => {
                setSearch("");
                setQuery("");
              }}
            >
              Clear search
            </button>
          </section>
        )}

      </main>
    </div>
  );
}

export default Search;

