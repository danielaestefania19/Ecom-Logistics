import AdvantagesPhoto from '../../../assets/AdvantagesPhoto.jpg';

const Advantages = () => (
  <section className="bg-white py-24 px-6  bg-no-repeat bg-cover bg-center">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
      <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
        <img
          src={AdvantagesPhoto}
          alt="AdvantagesPhoto"
          className="rounded-xl shadow-lg w-full max-w-xl"
        />
      </div>
      <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
        <div className="bg-primary rounded-2xl shadow-2xl p-10 text-center lg:text-left flex flex-col gap-6 max-w-xl transition-transform duration-300 hover:scale-105">
          <h2 className="text-2xl md:text-3xl font-bold text-third leading-tight tracking-tight">
            Stop wasting time and avoid extra fees with our reliable freight service!
          </h2>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-white leading-tight">24 - 72 Hrs</span>
            <span className="text-base text-white opacity-80">for delivery to Amazon FCs once it leaves our warehouse.</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-white leading-tight">98%</span>
            <span className="text-base text-white opacity-80">On-Time LTL & FTL Delivery Accuracy</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-white leading-tight">Free Daily Pickup</span>
            <span className="text-base text-white opacity-80">In the Bay Area</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Advantages;
