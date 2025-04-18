import map1 from "../../../assets/map1.jpg";

const CoverageMap = () => {
  return (
    <section className="bg-black text-white px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Título */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 mt-4">
          Our Amazon Partner Carrier Coverage
        </h2>
        {/* Imagen del mapa */}
        <div className="w-full max-w-3xl">
          <img
            src={map1}
            alt="Coverage Map"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default CoverageMap;
