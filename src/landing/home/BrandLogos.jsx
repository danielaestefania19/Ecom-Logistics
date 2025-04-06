import brand from '../../assets/brand.png'

const BrandLogos = () => {
  return (
    <section className="bg-primary py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Título */}
        <h2 className="text-center text-third text-2xl sm:text-3xl font-bold mb-10">
          Supported and backed by
        </h2>

        {/* Logos */}
        <div className="flex flex-wrap lg:flex-nowrap justify-center items-center gap-8 mb-10 lg:gap-12">

          {/* Marca 1 */}
          <div className="flex items-center gap-2 min-w-[140px] justify-center">
            <img src={brand} alt="Brand 1" className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain" />
            <span className="text-white font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">logoipsum</span>
          </div>

          {/* Marca 2 */}
          <div className="flex items-center gap-2 min-w-[140px] justify-center">
            <img src={brand} alt="Brand 2" className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain" />
            <span className="text-white font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">logoipsum</span>
          </div>

          {/* Marca 3 */}
          <div className="flex items-center gap-2 min-w-[140px] justify-center">
            <img src={brand} alt="Brand 3" className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain" />
            <span className="text-white font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">logoipsum</span>
          </div>

          {/* Marca 4 */}
          <div className="flex items-center gap-2 min-w-[140px] justify-center">
            <img src={brand} alt="Brand 4" className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain" />
            <span className="text-white font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">logoipsum</span>
          </div>

          {/* Marca 5 */}
          <div className="flex items-center gap-2 min-w-[140px] justify-center">
            <img src={brand} alt="Brand 5" className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain" />
            <span className="text-white font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">logoipsum</span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
