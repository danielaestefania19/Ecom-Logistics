import React from 'react'
import FastDelivery from '../../assets/FastDelivery.png'

export default function FastDeliverySection() {
    return (
        <section className="bg-white py-32 px-4">
            <div className="max-w-7xl mx-auto flex justify-center">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 w-full">
                    {/* Texto */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6 text-left lg:items-end lg:text-right">
                        <h2 className="text-3xl md:text-4xl font-bold text-third">
                            No More Low Inventory Fees!
                        </h2>

                        <p className="text-xl md:text-2xl font-semibold text-blue">
                            Your LTL Shipments Will <br/> Take 2–3 Days
                        </p>

                        <p className="text-xl md:text-2xl font-semibold text-blue">
                            To Arrive at Amazon <br/>Warehouse Once They <br/> Leave Ours
                        </p>

                        <p className="text-xl md:text-2xl font-semibold text-blue">
                            We Provide Free Expert Advisory
                        </p>
                    </div>

                    {/* Imagen */}
                    <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
                        <img
                            src={FastDelivery}
                            alt="LTL Shipment Delivery"
                            className="rounded-xl shadow-lg w-full max-w-lg"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
