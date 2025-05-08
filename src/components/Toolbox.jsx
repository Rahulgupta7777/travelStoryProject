import React, { useState } from "react";
import { FiType, FiImage, FiTrash2, FiCopy, FiEdit2 } from "react-icons/fi";
import themes from "./_constants/themes";

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

  const handleDelete = () => {
    targetRef.current.deleteSelected();
  };

  const handleDuplicate = () => {
    targetRef.current.duplicateSelected();
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-xl shadow-lg">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Add Elements
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddText}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{
              color: selectedTheme.properties.textColor,
              borderColor: selectedTheme.properties.primary,
              background: selectedTheme.properties.background,
            }}
          >
            <FiType className="text-lg" />
            <span>Add Text</span>
          </button>
          <button
            onClick={handleAddImage}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{
              color: selectedTheme.properties.textColor,
              borderColor: selectedTheme.properties.primary,
              background: selectedTheme.properties.background,
            }}
          >
            <FiImage className="text-lg" />
            <span>Add Image</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Theme</h3>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => handleThemeChange(theme)}
              className={`p-2 rounded-lg border transition-all ${
                selectedTheme.name === theme.name
                  ? "ring-2 ring-offset-2"
                  : "hover:bg-gray-50"
              }`}
              style={{
                borderColor: theme.properties.primary,
                background: theme.properties.background,
                ringColor: theme.properties.primary,
              }}
            >
              <div
                className="w-full h-12 rounded-md"
                style={{ background: theme.properties.buttonGradient }}
              />
              <span
                className="text-xs mt-1 block text-center"
                style={{ color: theme.properties.textColor }}
              >
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDuplicate}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{
              color: selectedTheme.properties.textColor,
              borderColor: selectedTheme.properties.primary,
              background: selectedTheme.properties.background,
            }}
          >
            <FiCopy className="text-lg" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{
              color: selectedTheme.properties.textColor,
              borderColor: selectedTheme.properties.primary,
              background: selectedTheme.properties.background,
            }}
          >
            <FiTrash2 className="text-lg" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbox;
