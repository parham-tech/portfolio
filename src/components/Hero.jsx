// src/components/Hero.jsx
import React, { useState } from "react";
import Button from "./Button";
import WeatherModal from "./WeatherModal";

const Hero = () => {
  const [showWeather, setShowWeather] = useState(false);

  return (
    <section className="flex flex-col md:flex-row items-center justify-between p-6 md:p-16 text-white min-h-[70vh] transition-all duration-1000 ease-in-out">
      
      {/* متن */}
      <div className="max-w-lg text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Hi, I’m <span className="text-orange-300">Parham</span>
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 leading-snug">
          Front-end Developer
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-6 leading-relaxed">
          Welcome to my portfolio website. <br className="hidden sm:block" />
          Glad to have you here. Explore my work and projects.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <Button type="primary" className="px-6 py-3 text-lg md:text-xl">
            View My Work
          </Button>
          <Button className="px-6 py-3 text-lg md:text-xl">Get in Touch</Button>
        </div>
      </div>

      {/* تصویر + Cloud */}
      <div className="mt-8 md:mt-0 md:ml-10 flex-shrink-0 relative flex justify-center md:justify-end overflow-visible">
        {/* تصویر اصلی */}
        <img
          src="/images/hero-monitor.png"
          alt="Monitor"
          className="w-48 sm:w-56 md:w-64 lg:w-72 h-auto relative z-10 drop-shadow-xl"
        />

        {/* Cloud با انیمیشن و glow */}
        <div className="absolute -top-8 sm:-top-10 md:-top-16 lg:-top-24 -right-6 sm:-right-8 md:-right-10 lg:-right-12 w-[130px] sm:w-[170px] md:w-[210px] lg:w-[270px] z-20">
          <img
            src="/images/cloud.png"
            alt=""
            aria-hidden="true"
            className="w-full h-auto animate-diagonal transition-transform duration-500 hover:scale-110 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
            loading="lazy"
          />
          {/* دکمه شفاف روی Cloud */}
          <button
            onClick={() => setShowWeather(true)}
            className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Open weather modal"
          />
        </div>

        {/* مودال آب‌وهوا */}
        {showWeather && (
          <WeatherModal onClose={() => setShowWeather(false)} />
        )}
      </div>
    </section>
  );
};

export default Hero;
