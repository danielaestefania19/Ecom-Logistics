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
      </video>

    </section>
  );
};

export default VideoSection;
