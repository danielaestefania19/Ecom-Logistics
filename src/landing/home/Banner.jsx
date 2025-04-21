import React from 'react';

const Banner = () => {
  return (
    <div className="relative z-50 isolate flex items-center gap-x-6 overflow-hidden bg-primary border-b border-divider px-6 py-2 sm:px-3.5 sm:before:flex-1">
      <div
        aria-hidden="true"
        className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      ></div>
      <div
        aria-hidden="true"
        className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-blue to-third opacity-20"
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
        ></div>
      </div>
      <div className="flex w-full items-center justify-between md:justify-center gap-x-3">
        <a
          className="text-small flex items-end sm:text-[0.93rem] text-foreground hover:opacity-80 transition-opacity"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span aria-label="rocket" className="hidden md:block" role="img">
           🎁 
          </span>
          <span
            className="inline-flex md:ml-1 animate-text-gradient font-medium bg-clip-text text-transparent bg-[linear-gradient(90deg,#FFEBF9_0%,#2D596D_50%,#FFEBF9_100%)]"
            style={{
              fontSize: 'inherit',
              backgroundSize: '200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
              Get a Discount of Up to 10% as a New Customer!
          </span>
        </a>
        <a href="#contact"
          className="flex group min-w-[120px] items-center font-semibold text-foreground shadow-sm gap-1.5 relative overflow-hidden rounded-full p-[1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          rel="noopener noreferrer"
        >
       <span className="absolute inset-[-1000%] animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,#19203C_0%,#2D596D_50%,#2D596D_100%)]"></span>
       
       <div  href="#contact"className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-primary group-hover:bg-primary/70 transition-primary px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
            Get 10% off
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              className="outline-none transition-transform group-hover:translate-x-0.5 [&>path]:stroke-[2px]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 12h16m0 0l-6-6m6 6l-6 6"
              ></path>
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Banner;
