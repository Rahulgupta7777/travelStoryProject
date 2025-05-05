import React, { useEffect, useRef } from "react";
import anime from "animejs";

export default function Loader({
  text = "Saving Travel Story Journal PDF...",
}) {
  const loaderRef = useRef(null);

  useEffect(() => {
    anime({
      targets: loaderRef.current,
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 800,
      easing: "easeOutQuad",
    });

    anime({
      targets: ".dot",
      scale: [1, 1.5, 1],
      opacity: [1, 0.5, 1],
      delay: anime.stagger(200, { start: 500 }),
      duration: 1000,
      loop: true,
      easing: "easeInOutSine",
    });
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]"
    >
      <div className="bg-white rounded-2xl p-6 text-center shadow-lg min-w-[280px] max-w-[90%]">
        <div className="text-xl font-semibold mb-2">
          ✈️ {text}
          <span className="dot mx-1">.</span>
          <span className="dot mx-1">.</span>
          <span className="dot mx-1">.</span>
        </div>
        <div className="text-sm text-gray-500">Please wait...</div>
      </div>
    </div>
  );
}
