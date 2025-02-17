import React from 'react';
import logo from '../assets/website/v_darkerlogo.png';

const Loader = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <img src={logo} alt="Loading" className="absolute inset-0 w-16 h-16 m-auto" />
            </div>
        </div>
    );
};

export default Loader;