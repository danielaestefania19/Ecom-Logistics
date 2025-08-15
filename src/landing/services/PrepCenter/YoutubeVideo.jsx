import React from "react";

export default function YoutubeVideo() {
  return (
    <div style={{ width: "100%", height: "800px" }}>
      <iframe
        src="https://www.youtube.com/embed/OakXRL5lOUs"
        title="Video de YouTube"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: "100%",
          height: "100%",
        }}
      ></iframe>
    </div>
  );
}
