import React, { useEffect, useRef, useState } from "react";

import { FaFileImage } from "react-icons/fa";
import { BiPen } from "react-icons/bi";

import themes from "./_constants/themes";

function Toolbox({ targetRef }) {
  const [imageSrc, setImageSrc] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const src = URL.createObjectURL(file);
      setImageSrc(src);
    }
  };
  return (
    <>
      <div className="w-[400px] p-4">
        <div className="space-y-3">
          <div
            className={`flex items-center gap-3 p-3 border rounded-md transition "bg-white hover:bg-gray-100 cursor-pointer shadow-sm`}
            onClick={() => {
              targetRef.current.addText();
            }}
          >
            <div className="text-lg text-gray-700">
              <BiPen />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Add Text</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <div
            className={`flex items-center gap-3 p-3 border rounded-md transition bg-white hover:bg-gray-100 cursor-pointer shadow-sm`}
          >
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-3">
                <div className="text-lg text-gray-700">
                  <FaFileImage />
                </div>
                Upload Image
              </div>
              <div className="p-4">
                <div className="mt-5 mb-5">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-black text-white hover:bg-gray-800 font-medium px-4 py-2 rounded border border-white shadow-sm transition duration-150"
                  >
                    Upload Image
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {imageSrc && (
                  <div className="mt-4 mb-4 flex justify-center">
                    <img
                      src={imageSrc}
                      alt="Uploaded"
                      className="max-w-xs border"
                      width={200}
                      height={200}
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    if (imageSrc) {
                      console.log(imageSrc);

                      targetRef.current.addImage(imageSrc);
                      setImageSrc(null);
                    }
                  }}
                  className={`${
                    !!imageSrc
                      ? "bg-black"
                      : "bg-gray-400 cursor-not-allowed opacity-50"
                  } text-white px-4 py-1 rounded shadow flex items-center gap-1`}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 mt-4 text-gray-800">
          Choose Theme
        </h2>
        <div className="space-y-3">
          {themes.map((theme, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 border rounded-md bg-gray-200 text-gray-500 cursor-not-allowed opacity-60 shadow-none"
            >
              <div>
                <div className="text-sm">{theme.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Toolbox;
