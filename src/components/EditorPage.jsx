import { FiLock, FiPlus, FiMinus } from "react-icons/fi";

import { useState, useRef } from "react";
import Toolbox from "./Toolbox";
import { FiDownload } from "react-icons/fi";
import { FiDownloadCloud } from "react-icons/fi";
import CanvasKa from "./CanvasKa";
import Loader from "./Loader";
import { Player } from "@remotion/player";
import { CanvasVideo } from "../../remotion/Composition";

export default function DotGridEditor() {
  const [zoomDisable, setZoomDisable] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.4);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [canvasElements, setCanvasElements] = useState([]);

  const targetRef = useRef();

  const handleDownloadPDF = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingMessage("Saving Travel Story Journal PDF...");
    try {
      await targetRef.current.downloadAsPDF();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage("");
      }, 500);
    }
  };

  const handleDownloadVideo = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingMessage("Generating Animated Travel Story Video...");
    try {
      const elements = await targetRef.current.getCanvasElements();
      setCanvasElements(elements);
      setShowVideoPreview(true);
    } catch (error) {
      console.error("Error generating video:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage("");
      }, 500);
    }
  };

  const handleRenderVideo = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingMessage("Rendering Video...");
    try {
      const response = await fetch("http://localhost:3001/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ elements: canvasElements }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to render video");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "travel-story.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error rendering video:", error);
      alert("Failed to render video: " + error.message);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage("");
      }, 500);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-white">
      <div className="flex justify-end gap-2 p-4 border-b shadow sticky top-0 bg-white z-10">
        <button
          className={`bg-white px-3 py-1 border rounded shadow flex items-center gap-1 transition-all ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
          onClick={handleDownloadPDF}
          disabled={isLoading}
        >
          <FiDownload />
          Download PDF
        </button>
        <button
          className={`bg-black text-white px-4 py-1 rounded shadow flex items-center gap-1 transition-all ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
          }`}
          onClick={handleDownloadVideo}
          disabled={isLoading}
        >
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
        </div>
      </div>

      {showVideoPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 max-w-[90%] w-[800px]">
            <h2 className="text-2xl font-semibold mb-4">Video Preview</h2>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Player
                component={CanvasVideo}
                durationInFrames={150}
                compositionWidth={800}
                compositionHeight={600}
                fps={30}
                inputProps={{ elements: canvasElements }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={() => setShowVideoPreview(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleRenderVideo}
              >
                Render Video
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <Loader text={loadingMessage} />}
    </div>
  );
}
