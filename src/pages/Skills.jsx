import React, { useEffect, useRef } from "react";

const skills = [
  { name: "HTML", percent: 90, colors: ["#3B82F6", "#60A5FA"], desc: "Semantic & Responsive Markup" },
  { name: "CSS / Tailwind", percent: 85, colors: ["#10B981", "#34D399"], desc: "Responsive Design & Utility Classes" },
  { name: "JS / React", percent: 80, colors: ["#FACC15", "#FBBF24"], desc: "Interactive UI & Components" },
  { name: "AI Tools", percent: 70, colors: ["#8B5CF6", "#A78BFA"], desc: "Various AI Tools Experience" },
  { name: "Performance & SEO", percent: 85, colors: ["#EF4444", "#F87171"], desc: "Lighthouse & SEO Best Practices" }
];

const Skills = () => {
  const circlesRef = useRef([]);
  const textsRef = useRef([]);

  useEffect(() => {
    skills.forEach((skill, i) => {
      const circle = circlesRef.current[i];
      const text = textsRef.current[i];
      if (!circle || !text) return;

      const radius = 45;
      const circumference = 2 * Math.PI * radius;
      circle.setAttribute("stroke-dasharray", circumference);
      circle.setAttribute("stroke-dashoffset", circumference);

      let progress = 0;

      const animate = () => {
        progress++;
        if (progress > skill.percent) return;
        const dashoffset = circumference - (progress / 100) * circumference;
        circle.setAttribute("stroke-dashoffset", dashoffset);
        text.textContent = progress + "%";
        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    });
  }, []);

  return (
    <section id="skills" className="py-16 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-12">Skills</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-center items-center">
        {skills.map((skill, i) => (
          <div key={skill.name} className="relative group">
            <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
              <defs>
                <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={skill.colors[0]} />
                  <stop offset="100%" stopColor={skill.colors[1]} />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-gray-200 stroke-4 fill-none"
              />
              <circle
                ref={(el) => (circlesRef.current[i] = el)}
                cx="50"
                cy="50"
                r="45"
                stroke={`url(#grad-${i})`}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text
                ref={(el) => (textsRef.current[i] = el)}
                x="50"
                y="55"
                textAnchor="middle"
                className="text-lg font-semibold fill-current text-gray-700"
              >
                0%
              </text>
            </svg>
            <p className="mt-4 font-medium">{skill.name}</p>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              {skill.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
