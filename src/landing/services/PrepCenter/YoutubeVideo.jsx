import React from "react";

export default function YoutubeVideo() {
  return (
    <div className="bg-primary">
    <div 
      style={{
        width: "100%",
        maxWidth: "1422px", // mantiene el ancho máximo similar al original
        margin: "0 auto", // centrado
      }}
    >
      <iframe
        src="https://www.youtube.com/embed/OakXRL5lOUs"
        title="Video de YouTube"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: "100%",
          aspectRatio: "16 / 9", // mantiene proporción
          display: "block",
        }}
      />
    </div>
    </div>
  );
}
