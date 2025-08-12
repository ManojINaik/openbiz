
import React from 'react';

const Logo: React.FC = () => {
    return (
        <div className="flex items-center space-x-3">
            <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/120px-Emblem_of_India.svg.png" 
                alt="Emblem of India" 
                className="h-12 md:h-14"
            />
            <div>
                <h1 className="text-white text-base md:text-lg font-bold leading-tight">सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय</h1>
                <h2 className="text-white text-xs md:text-sm leading-tight">Ministry of Micro, Small & Medium Enterprises</h2>
            </div>
      </div>
    );
};

export default Logo;
