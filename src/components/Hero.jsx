// src/components/Hero.jsx
import React from "react";
import Button from "./Button";

const Hero = ({ heroClass }) => {
  return (
    <section
      className={`flex flex-col md:flex-row items-center justify-between p-10 md:p-20 text-white transition-all duration-1000 ease-in-out ${heroClass}`}
    >
      <div className="max-w-lg">
        <h1 className="text-4xl font-bold mb-4">
          Hi, I’m <span className="text-orange-300">Parham</span>
        </h1>
        <h2 className="text-2xl font-semibold mb-4">Front-end Developer</h2>
        <p className="mb-6">
          "Welcome to my portfolio website." <br />
          "Glad to have you here. Explore my work and projects."
        </p>
        <div className="flex gap-4">
          <Button type="primary">View My Work</Button>
          <Button>Get in Touch</Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
