import videoBg from '../../assets/video.mp4';

const VideoSection = () => {
  return (
    <section className="relative h-[800px] w-full overflow-hidden">

      {/* 🎥 Video como fondo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={videoBg} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🌓 Overlay semitransparente para mejor contraste */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* 🧠 Contenido encima del video */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">SEE IT IN ACTION</h2>
        <p className="text-sm md:text-base max-w-xl">
          Watch Our Video to Get a Clear Understanding of How it Works
        </p>
      </div>

    </section>
  );
};

export default VideoSection;
