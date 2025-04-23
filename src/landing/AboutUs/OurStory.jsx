import ourstory from '../../assets/ourstory.png'; // Asegúrate de tener una imagen representativa

const OurStory = () => {
  return (
    <section className="bg-white py-24 px-6 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Imagen a la izquierda */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src={ourstory}
            alt="Ecom Logistics Story"
            className="rounded-2xl shadow-lg w-full max-w-md"
          />
        </div>

        {/* Texto a la derecha */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-4xl font-bold text-primary mb-6 text-center lg:text-left">
            Our Story
          </h2>

          <p className="text-lg text-primary leading-relaxed text-center lg:text-left mb-6">
            We’ve lived the e-commerce journey ourselves, so we truly understand what sellers need to grow. 
            Our experience has shaped every part of our service — from fast response times to flexible solutions — 
            because we know what it’s like to be on the other side.
          </p>

          <div className="border-l-4 border-primary pl-6 text-base md:text-lg text-gray-700 leading-relaxed space-y-5">
            <p>
              We started with a simple belief: 
              <span className="font-semibold text-primary"> logistics shouldn’t hold growing companies back.</span>
              As entrepreneurs, we knew how complex logistics could be for small businesses trying to scale.
            </p>
            <p>
              That’s why we created 
              <span className="font-semibold text-primary"> Ecom Logistics</span>, to simplify and optimize the logistics 
              process for e-commerce sellers of all sizes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
