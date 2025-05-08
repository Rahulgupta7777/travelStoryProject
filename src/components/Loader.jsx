import React, { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export default function Loader({
  text = "Saving Travel Story Journal PDF...",
}) {
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!loaderRef.current) return;
    const container = loaderRef.current;

    const fadeAnim = animate(container, {
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 800,
      easing: "easeOutQuad",
    });

    const pulseAnim = animate(".loader-container", {
      scale: [0.98, 1],
      opacity: [0.95, 1],
      duration: 1500,
      loop: true,
      direction: "alternate",
      easing: "easeInOutSine",
    });

    const dots = container.querySelectorAll(".dot");
    const dotsAnim = animate(dots, {
      translateY: [-8, 0],
      scale: [1, 1.5, 1],
      opacity: [0.4, 1, 0.4],
      duration: 1200,
      loop: true,
      direction: "alternate",
      easing: "easeOutElastic",
      delay: stagger(200, { start: 500 }),
    });

    const progressAnim = animate(".progress-bar", {
      width: ["0%", "100%"],
      duration: 2000,
      easing: "easeInOutQuad",
      loop: true,
    });

    return () => {
      fadeAnim.revert();
      pulseAnim.revert();
      dotsAnim.revert();
      progressAnim.revert();
    };
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999]"
    >
      <div className="loader-container bg-white rounded-2xl p-8 text-center shadow-2xl min-w-[320px] max-w-[90%] transform transition-all">
        <div className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
          <span className="animate-bounce">✈️</span>
          <span>{text}</span>
          <div className="flex items-center">
            <span className="dot mx-1 text-blue-500">.</span>
            <span className="dot mx-1 text-blue-500">.</span>
            <span className="dot mx-1 text-blue-500">.</span>
          </div>
        </div>
        <div className="text-sm text-gray-600 font-medium mb-4">
          Please wait while we process your request...
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div className="progress-bar bg-blue-500 h-1.5 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
