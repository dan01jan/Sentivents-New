import React from 'react';
import backgroundImage from '../../assets/website/bg.jpg'; 

function HomeScreen() {
  return (
    <div
      className="relative bg-cover bg-center h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        opacity: 0.6,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-30"></div> {/* Overlay to adjust opacity */}
     
    </div>
  );
}

export default HomeScreen;