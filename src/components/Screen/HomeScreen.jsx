import React from "react";
import backgroundVideo from "../../assets/website/bg.mp4";
import "../../index.css";

function HomeScreen() {
  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full min-h-[70vh]">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={backgroundVideo}
          autoPlay
          loop
          muted
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center h-full z-10 text-center">
          <div className="mb-10 text-4xl font-semibold text-white font-tungsten">
            VOYS
          </div>
          <div className="mb-10 text-2xl font-semibold text-white">
            An Event Management System with Sentiment Analysis
          </div>
          <div className="p-1 border-2 border-double border-white">
            <button className="px-9 py-4 bg-[#3795bd] text-white text-lg font-semibold hover:bg-[#2a0858] transition">
              Download our App
            </button>
          </div>
        </div>
      </div>

      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl text-black font-semibold mb-4">2nd screen</h2>
        </div>
      </div>

      <div className="w-full min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-semibold mb-4">3rd screen</h2>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
