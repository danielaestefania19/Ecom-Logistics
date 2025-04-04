import React from 'react';
//import cohete from "../assets/cohete2.png";
import {
    Button
} from "@heroui/react";

const Banner = () => {
    return (
        <div>
        <div id="sticky-banner" tabIndex="-1" className="fixed top-0 start-0 z-50 flex justify-between w-full p-4 bg-primary">
            <div className="flex items-center mx-auto">
                <p className="flex items-center text-sm font-normal text-white dark:text-gray-400 banner-text">
                    Get A Discount Of Up To 50% For Orders This Month!
                    <Button color="white" radius="full" size="md" variant='shadow' className="ml-8 flex flex-col -gap-2 bg-white">
                        <p className="m-3 text-third font-semibold text-base">Get 50% off</p>
                    </Button>

                </p>
            </div>
        </div>
         <div className="border-t bg-black w-full mt-[4px]"></div> 
        </div>
    );
}

export default Banner;