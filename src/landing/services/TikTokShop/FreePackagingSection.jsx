import React from 'react'
import Box from '../../../assets/Box.jpg'

const FreePackagingSection = () => {
    return (
        <section 
        id="free-packaging"
        className="bg-primary py-32 px-6  bg-no-repeat bg-cover bg-center">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
                    <img
                        src={Box}
                        alt="AdvantagesTiktok"
                        className="rounded-xl shadow-lg w-full max-w-xl"
                    />
                </div>
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 text-center lg:text-left flex flex-col gap-6 max-w-xl transition-transform duration-300 hover:scale-105">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-black leading-tight tracking-tight">
                            Don’t Forget! All Packaging Materials Are Included 📦
                        </h2>
                        <div className="flex flex-col gap-1">
                            <span className="text-base text-black opacity-80">
                            No need to worry about extra charges. Everything is covered in our pricing. Your boxes, tape, labels, and materials are all included so you can focus on growing your business while we handle the rest.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FreePackagingSection