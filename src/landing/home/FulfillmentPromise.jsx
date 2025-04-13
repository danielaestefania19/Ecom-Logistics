import React from 'react'
import Fulfillment from '../../assets/Fulfillment.png'

export default function FulfillmentPromise() {
    return (
        <section className="bg-primary py-32 px-4">
            <div className="max-w-7xl mx-auto flex justify-center">
                <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-31 w-full">
                    {/* Imagen */}
                    <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
                        <img
                            src={Fulfillment} // Puedes cambiar esta URL
                            alt="Fulfillment warehouse"
                            className="rounded-xl shadow-lg w-full max-w-lg"
                        />
                    </div>
                    {/* Texto */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6 text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            Top-Rated Fulfillment Center <br/> on the West Coast
                        </h2>

                        <p className="text-xl md:text-2xl font-semibold text-third">
                            99.9% 
                            <span className="text-xl text-white ml-2">Order Accuracy</span>
                        </p>

                        <p className="text-xl md:text-2xl font-semibold  text-third">
                            99% 
                            <span className="text-xl text-white ml-2"> On-Time Delivery(daily outbound shipments)</span>
                        </p>

                        <p className="text-xl md:text-2xl font-semibold  text-third">
                            24 - 48 Hrs 
                            <span className="text-xl text-white ml-2"> to Prepare Your Products</span>
                    
                        </p>
                    </div>


                </div>
            </div>
        </section>
    )
}
