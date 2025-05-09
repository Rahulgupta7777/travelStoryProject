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
import Canvas from "./Canvas";
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
    const elements = targetRef.current.canvasElement;
    if (!elements || elements.length === 0) {
      alert("No elements to preview. Please add some content first.");
      return;
    }
    setCanvasElements(elements);
    setShowVideoPreview(true);
  };

  const handleRecordAndDownload = async () => {
    setIsLoading(true);
    setLoadingMessage("Recording 5s video of canvas...");
    try {
      const canvasNode =
        targetRef.current?.getCanvasNode?.() ||
        document.querySelector("canvas");
      if (!canvasNode) throw new Error("Canvas not found");
      const stream = canvasNode.captureStream(30);
      const recordedChunks = [];
      const mediaRecorder = new window.MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "canvas-recording.webm";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      };
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        setIsLoading(false);
        setLoadingMessage("");
        setShowVideoPreview(false);
      }, 5000);
    } catch (error) {
      setIsLoading(false);
      setLoadingMessage("");
      alert("Failed to record video: " + error.message);
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
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-end items-center justify-between">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                fontFamily: "'Great Vibes', cursive",
                background: "linear-gradient(90deg, #1a365d 0%, #38b2ac 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.04em",
                marginBottom: 0,
                lineHeight: 1.1,
                marginLeft: "300px",
                textShadow: "0 2px 8px rgba(56,178,172,0.12)",
              }}
            >
              Canvas
            </h1>
            <div className="flex flex-row items-center gap-1 ml-[350px]">
              <button
                className={`bg-white px-3 py-2 border border-gray-300 rounded-lg shadow transition-all duration-200 ease-in-out flex items-center gap-2 text-sm font-medium ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-md hover:border-gray-400"
                }`}
                onClick={handleDownloadPDF}
                disabled={isLoading}
                style={{ height: "36px", fontSize: "13px" }}
              >
                <FiDownload className="text-gray-500 text-base" />
                <span>Download PDF</span>
              </button>
              <button
                className={`bg-white px-3 py-2 border border-gray-300 rounded-lg shadow transition-all duration-200 ease-in-out flex items-center gap-2 text-sm font-medium ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-md hover:border-gray-400"
                }`}
                onClick={handleDownloadVideo}
                disabled={isLoading}
                style={{ height: "36px" }}
              >
                <FiDownloadCloud className="text-gray-500 text-base" />
                <span>Download Video</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full fixed left-2 top-0 z-20">
          <div className="flex flex-col gap-2 p-2 bg-white/90 border border-gray-200 rounded-xl shadow-lg mt-16">
            <button
              className="bg-white w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 shadow hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 text-lg"
              onClick={() => !zoomDisable && setZoomLevel(zoomLevel * 1.05)}
              title="Zoom In"
            >
              <FiPlus className="text-gray-600" />
            </button>
            <button
              className="bg-white w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 shadow hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 text-lg"
              onClick={() => !zoomDisable && setZoomLevel(zoomLevel * 0.95)}
              title="Zoom Out"
            >
              <FiMinus className="text-gray-600" />
            </button>
            <button
              className={`w-8 h-8 flex items-center justify-center rounded-lg border shadow text-lg transition-all duration-200 ${
                zoomDisable
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-blue-400"
              }`}
              onClick={() => setZoomDisable(!zoomDisable)}
              title="Lock/Unlock Zoom"
            >
              <FiLock />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto">
          <Canvas zoomLevel={zoomLevel} ref={targetRef} theme={selectedTheme} />
        </div>

        {/* Toolbox */}
        <div className="w-72 p-4 border-l shadow-sm bg-white sticky right-0 top-0 z-10">
          <Toolbox targetRef={targetRef} onThemeChange={setSelectedTheme} />
        </div>
      </div>

      {isLoading && <Loader message={loadingMessage} />}

      {showVideoPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Video Preview</h2>
              <button
                onClick={() => setShowVideoPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Player
                component={CanvasVideo}
                inputProps={{ elements: canvasElements }}
                durationInFrames={150}
                fps={30}
                compositionWidth={1920}
                compositionHeight={1080}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleRecordAndDownload}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Download Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
