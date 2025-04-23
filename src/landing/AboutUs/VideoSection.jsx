import Story from '../../assets/Story.mp4';

const VideoSection = () => {
  return (
    <section className="relative w-full overflow-hidden h-[50vh] sm:h-[70vh] md:h-[90vh] lg:h-[100vh]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={Story} type="video/mp4" />
      </video>
    </section>
  );
};

export default VideoSection;
