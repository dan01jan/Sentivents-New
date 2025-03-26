import React from "react";
import eventBG from "../../assets/website/eventbg_flip.png";
import eventVOYS from "../../assets/website/aboutvoys.png";
import logo from "../../assets/website/V_Logo.png";
import TUPLogo from "../../assets/website/TUP LOGO.png";

function About() {
  return (
    <>
      <div
        className="w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[70vh] flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${eventBG})` }}
      >
        <div className="max-w-screen-xl w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center">
            <img
              className="w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px] h-auto object-cover shadow-2xl"
              src={eventVOYS}
              alt="VOYS Event"
            />
          </div>
          <div className="w-full text-center md:text-left">
            <h5 className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[100px] xl:text-[160px] font-tungsten text-[#3a1078] leading-tight uppercase">
              about voys
            </h5>
            <p className="text-black text-base md:text-lg">
            To be the leading platform that amplifies voices, fosters meaningful conversations, and drives positive change through innovative and inclusive event management.
            </p>
          </div>
        </div>
      </div>

      {/* 🔹 Mission Section */}
      <section className="w-full flex flex-col justify-center items-center bg-[#f7f7f8] py-16 px-6">
        <div className="max-w-screen-lg w-full text-center">
          <h2 className="text-[8vw] sm:text-[6vw] md:text-[4vw] lg:text-[5vw] font-tungsten text-[#3a1078] leading-tight uppercase mb-6">
            Mission
          </h2>
          <p className="text-black text-base md:text-lg">
          Empower individuals by providing a platform where voices can be heard, ideas can be shared, and meaningful conversations can take place. We strive to innovate event management by integrating technology and creativity to ensure impactful and engaging experiences. Through inclusivity and collaboration, we aim to foster a community where every sentiment is valued and has the potential to inspire positive change. By bridging expression with action, we seek to transform voices into movements, creating a lasting impact on society.
          </p>
        </div>
      </section>

      {/* 🔹 Footer Section */}
      <footer className="w-full bg-[#ffffff] py-10 px-6 text-center text-gray-800 flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="flex items-center gap-4">
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
