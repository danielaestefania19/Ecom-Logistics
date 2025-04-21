import FreeStorage from '../../../assets/FreeStorage.jpg'
import { Button } from "@heroui/react"; // O usa un <button> clásico si no usas HeroUI

const FreeStorageOffer = () => {
    return (
        <section className="bg-white py-24 px-6  bg-no-repeat bg-cover bg-center">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
                    <img
                        src={FreeStorage}
                        alt="Warehouse"
                        className="rounded-xl shadow-lg w-full max-w-xl"
                    />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 leading-tight tracking-tight">
                        7 Days Free Storage!
                    </h2>
                    <p className="text-xl text-black mb-4">
                        Get the First Week On Us – Fast, Reliable Warehousing
                    </p>
                    <p className="text-lg text-black mb-8">
                        Take advantage of our introductory offer and enjoy peace of mind with secure storage.
                    </p>
                    <Button
                        size="lg"
                        className="text-white bg-third hover:bg-third-dark px-8 py-4 rounded-xl transition duration-300 ease-in-out"
                    >
                        Get our storage prices
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FreeStorageOffer;