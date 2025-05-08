import {
  FiLock,
  FiPlus,
  FiMinus,
  FiDownload,
  FiDownloadCloud,
  FiImage,
  FiType,
  FiX,
} from "react-icons/fi";

import { useState, useRef } from "react";
import Toolbox from "./Toolbox";
import CanvasKa from "./CanvasKa";
import Loader from "./Loader";
import { Player } from "@remotion/player";
import { CanvasVideo } from "../../remotion/Composition";
import themes from "./_constants/themes";

export default function DotGridEditor() {
  const [zoomDisable, setZoomDisable] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.4);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);

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
      if (!elements || elements.length === 0) {
        throw new Error(
          "No elements to preview. Please add some content first."
        );
      }
      setCanvasElements(elements);
      setShowVideoPreview(true);
    } catch (error) {
      console.error("Error generating video:", error);
      alert(error.message);
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
      setShowVideoPreview(false);
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
    <div className="h-screen flex flex-col bg-gray-50  ">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-row items-center justify-between">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "-0.02em",
                marginBottom: 0,
                lineHeight: 1.2,
                marginLeft: "500px",
              }}
            >
              Canvas
            </h1>
            <div className="flex flex-row items-center gap-1 ml-[450px] ">
              <button
                className={`bg-white px-5 py-2.5 border border-gray-300 rounded-xl shadow transition-all duration-200 ease-in-out flex items-center gap-2 text-sm font-medium px-9 ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-md hover:border-gray-400"
                }`}
                onClick={handleDownloadPDF}
                disabled={isLoading}
                style={{ height: "44px" }}
              >
                <FiDownload className="text-gray-500 text-base" />
                <span>Download PDF</span>
              </button>

              <button
                className={`bg-white px-5 py-2.5 border border-gray-300 rounded-xl shadow transition-all duration-200 ease-in-out flex items-center gap-2 text-sm font-medium px-9  ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-md hover:border-gray-400"
                }`}
                onClick={handleDownloadVideo}
                disabled={isLoading}
                style={{ height: "44px" }}
              >
                <FiDownloadCloud className="text-gray-500 text-base" />
                <span>Download Video</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="flex flex-col gap-3 p-4 border-r shadow-sm bg-white sticky left-0 top-0 z-10">
          <button
            className="bg-white p-2 border rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            onClick={() => !zoomDisable && setZoomLevel(zoomLevel * 1.05)}
          >
            <FiPlus className="text-gray-600" />
          </button>
          <button
            className="bg-white p-2 border rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            onClick={() => !zoomDisable && setZoomLevel(zoomLevel * 0.95)}
          >
            <FiMinus className="text-gray-600" />
          </button>
          <button
            className={`p-2 border rounded-lg shadow-sm transition-colors ${
              zoomDisable
                ? "bg-gray-800 text-white"
                : "bg-white hover:bg-gray-50 text-gray-600"
            }`}
            onClick={() => setZoomDisable(!zoomDisable)}
          >
            <FiLock />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto">
          <CanvasKa
            zoomLevel={zoomLevel}
            ref={targetRef}
            theme={selectedTheme}
          />
        </div>

        {/* Right Toolbar */}
        <div className="p-4 border-l shadow-sm bg-white sticky right-0 top-0">
          <Toolbox targetRef={targetRef} onThemeChange={setSelectedTheme} />
        </div>
      </div>

      {/* Video Preview Modal */}
      {showVideoPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 max-w-[90%] w-[800px] shadow-xl relative">
            <button
              onClick={() => setShowVideoPreview(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="text-gray-500" />
            </button>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{
                background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "-0.02em",
              }}
            >
              Video Preview
            </h2>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner">
              <Player
                component={CanvasVideo}
                durationInFrames={150}
                compositionWidth={800}
                compositionHeight={600}
                fps={30}
                inputProps={{ elements: canvasElements }}
                style={{ width: "100%", height: "100%" }}
                controls
                autoPlay
                loop
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowVideoPreview(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
