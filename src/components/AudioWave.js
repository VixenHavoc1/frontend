"use client";
import { useEffect, useRef, useState } from "react";

export default function SpotifyStyleAudioPlayer({ url }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#121212",
        color: "#fff",
        padding: "12px 16px",
        borderRadius: "8px",
        maxWidth: "500px",
        width: "100%",
        gap: "16px",
      }}
    >
      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: "24px",
          cursor: "pointer",
        }}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* Progress bar */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "#404040",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#1db954", // Spotify green
            }}
          />
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={url} />
    </div>
  );
}
