import { Button } from "@heroui/react";

const Logistics = () => {
    return (
        <section className="bg-white py-32 px-4">
            <div className="max-w-7xl mx-auto flex justify-center items-center text-center">
                <div className="px-2 md:px-0">
                    <h2 className="text-third text-xl sm:text-2xl font-bold mb-1">
                        Ready to Talk?
                    </h2>
                    <span className="block text-black text-2xl sm:text-3xl font-bold mt-4">
                        Shipfusion ecommerce fulfillment.
                    </span>
                    <span className="block text-black text-2xl sm:text-3xl font-bold">
                        Fast. Reliable. Consistent.
                    </span>
                    <span className="block text-black text-xl sm:text-xl font-medium mt-4">
                        You're E-Commerce Logistics Partner
                    </span>
                </div>
            </div>
            <div className="md:col-span-2 flex justify-center mt-12">
                <a href="#contact">
                    <Button
                        radius="full"
                        className="w-full sm:w-auto px-10 py-4 sm:py-5 text-base sm:text-lg md:text-xl bg-third text-white font-semibold"
                        type="submit"
                    >
                       Contact Us!
                    </Button>
                    </a>
                </div>
        </section>
    );
};

export default Logistics;
