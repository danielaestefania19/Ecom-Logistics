const YouTubeSection = () => {
  return (
   <section className="relative w-full overflow-hidden h-[60vh] sm:h-[70vh] md:h-[90vh] lg:h-[100vh]">
      <iframe
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="https://www.youtube.com/embed/HTIpOCy5_NI?autoplay=1&mute=1&loop=1&playlist=HTIpOCy5_NI&controls=1&modestbranding=1"
        title="Video de YouTube"
        frameBorder="0"
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
      ></iframe>
    </section>
  );
};

export default YouTubeSection;
