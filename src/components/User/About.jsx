import React from "react";
import eventBG from "../../assets/website/eventBG_flip.png";
import eventVOYS from "../../assets/website/aboutvoys.png";
import logo from "../../assets/website/V_logo.png";
import TUPLogo from "../../assets/website/TUP logo.png";
function About() {
  return (
    <>
      <div
        className="w-full h-[70vh] flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${eventBG})` }}
      >
        <div className="max-w-full w-full px-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-4 mb-8 md:mb-0 mr-5 items-center">
            <img
              className="w-full max-w-[700px] md:max-w-[700px] lg:max-w-[700px] h-auto object-cover shadow-2xl"
              src={eventVOYS}
              alt="VOYS Event"
            />
          </div>
          <div className="relative w-full h-auto flex flex-col justify-center md:justify-end">
            <h2 className="text-[12vw] sm:text-[15vw] md:text-[10vw] lg:text-[150px] xl:text-[200px] font-tungsten text-[#3a1078] leading-tight uppercase">
              about voys
            </h2>
            <p className="text-black text-base md:text-lg">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Provident, ullam nihil repudiandae consequuntur ducimus
              necessitatibus eveniet velit eaque voluptatem pariatur aliquam,
              praesentium nostrum magnam accusantium explicabo quae sint vero
              sed.
            </p>
          </div>
        </div>
      </div>
      <section className="w-auto h-auto flex flex-col justify-center items-center bg-[#f7f7f8] py-16">
        <div className="max-w-[200vh] w-full px-10">
          <h2 className="text-[5vw] sm:text-[6vw] md:text-[4vw] lg:text-[5vw] font-tungsten text-[#3a1078] leading-tight uppercase text-center mb-8">
            Mission
          </h2>
          <p className="text-black text-base md:text-lg text-center">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Provident,
            ullam nihil repudiandae consequuntur ducimus necessitatibus eveniet
            velit eaque voluptatem pariatur aliquam, praesentium nostrum magnam
            accusantium explicabo quae sint vero sed.
          </p>
        </div>
      </section>
      <footer className="w-full bg-[#ffffff] py-10 px-10 text-center text-gray-800 flex flex-col items-center gap-4 ">
        <div className="flex justify-center items-center gap-4">
          <img src={logo} alt="VOYS Logo" className="h-12 w-auto" />
          <img src={TUPLogo} alt="TUP Logo" className="h-12 w-auto" />
        </div>
        <p className="text-sm">
          &copy; 2024-2025. Empowering Events, Amplifying Voices — VOYS Event
          Management System
        </p>
      </footer>
    </>
  );
}

export default About;
