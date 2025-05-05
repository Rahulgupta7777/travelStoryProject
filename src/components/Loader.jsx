import React, { useEffect, useRef } from "react";
<<<<<<< Updated upstream
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
=======
import { anime } from "animejs";

function Toast() {
  const progressRef = useRef(null);

  const handleProgress = () => {
    anime({
      targets: progressRef.current,
      width: "100%",
      easing: "linear",
      duration: 5000, // Adjust duration as needed
    });
  };

  useEffect(() => {
    handleProgress();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 flex flex-col items-start max-w-sm">
      <div id="toast-progress">
        <p className="text-base font-medium text-gray-800">
          Processing:
          <span className="ml-2 relative top-1 block w-64 h-5 bg-gray-200 rounded overflow-hidden">
            <span
              ref={progressRef}
              className="bg-blue-500 h-full block"
              style={{ width: "0%" }}
            ></span>
          </span>
        </p>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
<<<<<<< Updated upstream
=======

export default Toast;
>>>>>>> Stashed changes
