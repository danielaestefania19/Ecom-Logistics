import React from 'react'
import Fulfillment from '../../assets/Fulfillment.png'

export default function FulfillmentPromise() {
    return (
        <section
            className="py-24 px-6 bg-primary"
        >
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
                    <img
                        src={Fulfillment}
                        alt="Fulfillment warehouse"
                        className="rounded-xl shadow-lg w-full max-w-xl transition-transform duration-300 hover:scale-105"
                    />
                </div>
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
                    <div className="p-10 text-center lg:text-left flex flex-col gap-6 max-w-xl">
                        <h2 className="text-2xl md:text-3xl font-bold text-third leading-tight tracking-tight">
                            Top-Rated Fulfillment Center <br /> on the West Coast
                        </h2>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-white leading-tight">99.9%</span>
                            <span className="text-base text-white opacity-80">Order Accuracy</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-white leading-tight">99%</span>
                            <span className="text-base text-white opacity-80">
                                On-Time Delivery (daily outbound shipments)
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-white leading-tight">24 - 48 Hrs</span>
                            <span className="text-base text-white opacity-80">to Prepare Your Products</span>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
