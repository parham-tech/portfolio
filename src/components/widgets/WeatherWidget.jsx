import React, { useState, useEffect } from "react";

const WeatherWidget = () => {
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=35&longitude=51&hourly=temperature_2m")
      .then(res => res.json())
      .then(data => setTemp(data.hourly.temperature_2m[0].toFixed(1)));
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-700 rounded text-white text-center p-2">
      {temp ? <span className="text-lg">{temp}°C</span> : <span>Loading...</span>}
      <span className="text-xs mt-1">Tehran Weather</span>
    </div>
  );
};

export default WeatherWidget;
