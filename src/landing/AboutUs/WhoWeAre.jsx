import Team from '../../assets/Team.png';

const WhoWeAre = () => {
    return (
        <section className="bg-white py-24 px-6 lg:px-24">
            <div className="max-w-6xl mx-auto flex flex-col gap-12 lg:flex-row items-center">
                {/* Texto */}
                <div className="w-full lg:w-2/3">
                    <h2 className="text-4xl font-bold text-primary mb-6 text-center lg:text-left">
                        Who We Are
                    </h2>
                    <p className="text-lg text-third leading-relaxed mb-6 text-center lg:text-left">
                        At Ecom Logistics, we deliver smart, scalable logistics solutions designed for today’s fast-paced e-commerce world.
                        Based in the Bay Area, California, we operate from one of the country’s most strategic logistics hubs,
                        right next to the ports and suppliers that keep America moving.
                    </p>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed text-center lg:text-left">
                        We specialize in key services that support the full e-commerce supply chain, including{" "}
                        <span className="font-semibold text-primary">LTL pallet shipping</span>,{" "}
                        <span className="font-semibold text-primary">3PL fulfillment</span>,{" "}
                        <span className="font-semibold text-primary">Amazon FBA prep</span>, and{" "}
                        <span className="font-semibold text-primary">local moving solutions</span>. Whether you’re a growing brand or a high-volume seller,
                        our team is here to make your logistics easier, faster, and more efficient.
                    </p>
                </div>

                {/* Imagen decorativa opcional */}
                <div className="w-full lg:w-1/3 flex justify-center mt-10 lg:mt-0">
                    <img
                        src={Team} // reemplaza por la ruta de tu ilustración o ícono
                        alt="Ecom Logistics Team"
                        className="rounded-xl shadow-lg w-full max-w-xs"
                    />
                </div>
            </div>
        </section>
    );
};

export default WhoWeAre;
