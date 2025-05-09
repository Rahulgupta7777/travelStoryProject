import React, { useState } from "react";
import { FiType, FiImage, FiTrash2, FiCopy, FiEdit2 } from "react-icons/fi";
import themes from "./_constants/themes";
import StickerPanel from "./StickerPanel";

function Toolbox({ targetRef, onThemeChange }) {
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    onThemeChange(theme);
  };

  const handleAddText = () => {
    targetRef.current.addText();
  };

  const handleAddImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          targetRef.current.addImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddSticker = (sticker) => {
    targetRef.current.addSticker(sticker);
  };

  const handleDelete = () => {
    targetRef.current.deleteSelected();
  };

  const handleDuplicate = () => {
    targetRef.current.duplicateSelected();
  };

  const handleClearCanvas = () => {
    targetRef.current.clearCanvas();
  };

  return (
    <div className="flex flex-col gap-3 p-2 bg-white rounded-lg shadow h-full overflow-y-auto">
      {/* Add Elements Section */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-1">
          Add Elements
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddText}
            className="flex items-center justify-center gap-2 px-2 py-1 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
            style={{
              color: selectedTheme.properties.textColor,
              borderColor: selectedTheme.properties.primary,
              background: selectedTheme.properties.background,
            }}
          >
            <FiType className="text-lg" />
            <span className="text-sm font-medium">Add Text</span>
          </button>
          <button
            onClick={handleAddImage}
            className="flex items-center justify-center gap-2 px-2 py-1 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
            style={{
              color: selectedTheme.properties.textColor,
              borderColor: selectedTheme.properties.primary,
              background: selectedTheme.properties.background,
            }}
          >
            <FiImage className="text-lg" />
            <span className="text-sm font-medium">Add Image</span>
          </button>
        </div>
      </div>

      {/* Stickers Section */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-1">
          Stickers
        </h3>
        <StickerPanel onAddSticker={handleAddSticker} />
      </div>

      {/* Theme Section */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-1">
          Theme
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => handleThemeChange(theme)}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                selectedTheme.name === theme.name
                  ? "ring-2 ring-offset-2 ring-blue-500"
                  : "hover:border-blue-400 hover:bg-blue-50"
              }`}
              style={{
                borderColor: theme.properties.primary,
                background: theme.properties.background,
                ringColor: theme.properties.primary,
              }}
            >
              <div
                className="w-full h-8 rounded mb-1"
                style={{ background: theme.properties.buttonGradient }}
              />
              <span
                className="text-xs font-medium block text-center"
                style={{ color: theme.properties.textColor }}
              >
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions Section */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-1">
          Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDuplicate}
            className="flex items-center justify-center gap-2 px-2 py-1 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
            style={{
              color: selectedTheme.properties.textColor,
              borderColor: selectedTheme.properties.primary,
              background: selectedTheme.properties.background,
            }}
          >
            <FiCopy className="text-lg" />
            <span className="text-sm font-medium">Duplicate</span>
          </button>
          <button
            onClick={handleClearCanvas}
            className="flex items-center justify-center gap-2 px-2 py-1 rounded-lg border border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
            style={{
              color: selectedTheme.properties.textColor,
              borderColor: selectedTheme.properties.primary,
              background: selectedTheme.properties.background,
            }}
          >
            <FiTrash2 className="text-lg" />
            <span className="text-sm font-medium">Clear Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbox;
