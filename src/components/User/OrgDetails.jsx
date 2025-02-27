import React from "react";
import orgimg from "../../assets/website/org/Association of Civil Engineering Students of TUP Taguig Campus(ACES).jpg"
import eventBG from "../../assets/website/eventBG.png";

function OrgDetails() {
  return (
    <div className="flex flex-col">
      <section
        className="w-full h-[70vh] flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${eventBG})` }}
      >
        <div className="max-w-[150vh] w-full px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-[10vw] sm:text-[8vw] md:text-[6vw] lg:text-[8vw] font-tungsten text-[#3a1078] leading-none uppercase">
              Organization Name
            </h2>
            <p className="text-black text-base md:text-lg">
              Organization description goes here. Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Integer nec odio. Praesent libero.
              Sed cursus ante dapibus diam.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-cover rounded-full"
              src={orgimg}
              alt="Organization Image"
            />
          </div>
        </div>
      </section>
      <section className="w-full h-auto flex flex-col items-center bg-[#f7f7f8] py-16">
        <div className="max-w-[150vh] w-full px-6 md:px-10">
          <h2 className="text-[19vw] sm:text-[8vw] md:text-[6vw] lg:text-[5vw] font-tungsten text-[#3a1078] leading-none uppercase text-center md:text-left mb-8">
            Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <img
              className="w-full h-auto object-cover rounded-lg"
              src={orgimg}
              alt="Organization Image"
            />
            <img
              className="w-full h-auto object-cover rounded-lg"
              src={orgimg}
              alt="Organization Image"
            />
            <img
              className="w-full h-auto object-cover rounded-lg"
              src={orgimg}
              alt="Organization Image"
            />
          </div>
        </div>
      </section>
      <section className="w-full h-auto flex flex-col items-center bg-[#f7f7f8] py-16">
        <div className="max-w-[150vh] w-full px-6 md:px-10">
          <h2 className="text-[19vw] sm:text-[8vw] md:text-[6vw] lg:text-[5vw] font-tungsten text-[#3a1078] leading-none uppercase text-center md:text-left mb-8">
            Officers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <img
              className="w-full h-auto object-cover rounded-lg"
              src={orgimg}
              alt="Organization Image"
            />
            <img
              className="w-full h-auto object-cover rounded-lg"
              src={orgimg}
              alt="Organization Image"
            />
            <img
              className="w-full h-auto object-cover rounded-lg"
              src={orgimg}
              alt="Organization Image"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default OrgDetails;
