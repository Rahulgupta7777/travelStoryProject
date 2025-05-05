import { FiLock, FiPlus, FiMinus } from "react-icons/fi";

import { useState, useRef } from "react";
import Toolbox from "./Toolbox";
import { FiDownload } from "react-icons/fi";
import { FiDownloadCloud } from "react-icons/fi";
import CanvasKa from "./CanvasKa";
<<<<<<< Updated upstream
=======
// import Loader from "./Loader";
>>>>>>> Stashed changes

export default function DotGridEditor() {
  const [zoomDisable, setZoomDisable] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.4);

  const targetRef = useRef();

  return (
    <div className="w-screen h-screen flex flex-col bg-white">
      <div className="flex justify-end gap-2 p-4 border-b shadow sticky top-0 bg-white z-10">
        <button
          className="bg-white px-3 py-1 border rounded shadow flex items-center gap-1"
          onClick={() => {
            targetRef.current.downloadAsPDF();
          }}
        >
          <FiDownload />
          Download PDF
        </button>
        <button className="bg-black text-white px-4 py-1 rounded shadow flex items-center gap-1">
          <FiDownloadCloud />
          Download Animated Video
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col gap-2 p-4 border-r shadow bg-white sticky left-0 top-0 z-10">
          <button
            className="bg-white p-1 border rounded shadow"
            onClick={() => !zoomDisable && setZoomLevel(zoomLevel * 1.05)}
          >
            <FiPlus />
          </button>
          <button
            className="bg-white p-1 border rounded shadow"
            onClick={() => !zoomDisable && setZoomLevel(zoomLevel * 0.95)}
          >
            <FiMinus />
          </button>
          <button
            className={`bg-${zoomDisable ? "black" : "white"} p-1 text-${
              !zoomDisable ? "black" : "white"
            } border rounded shadow`}
            onClick={() => setZoomDisable(!zoomDisable)}
          >
            <FiLock />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <CanvasKa zoomLevel={zoomLevel} ref={targetRef} />
        </div>

        <div className="p-4 border-l shadow bg-white sticky right-0 top-0">
          <Toolbox targetRef={targetRef} />
          {/* <Loader /> */}
        </div>
      </div>
    </div>
  );
}
