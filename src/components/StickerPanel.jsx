import React from "react";
import { availableStickers } from "./_constants/stickers";

function StickerPanel({ onAddSticker }) {
  return (
    <div className="w-56 p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-6">Stickers</h3>
      <div className="grid grid-cols-2 gap-4">
        {availableStickers.map((sticker) => (
          <button
            key={sticker.name}
            onClick={() => onAddSticker(sticker)}
            className="group relative aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors overflow-hidden p-3"
          >
            <img
              src={sticker.url}
              alt={sticker.name}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default StickerPanel;
