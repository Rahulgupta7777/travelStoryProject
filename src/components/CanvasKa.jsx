import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import interact from "interactjs";
import { jsPDF } from "jspdf";
import { FiType, FiEdit2 } from "react-icons/fi";

export default forwardRef(({ zoomLevel, theme }, ref) => {
  const containerRef = useRef(null);
  const textAreaRef = useRef(null);
  const editorRef = useRef(null);

  const [elements, setElements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useImperativeHandle(ref, () => ({
    addText: () => {
      const newId = Date.now();
      setElements((prev) => [
        ...prev,
        {
          id: newId,
          type: "text",
          x: 100,
          y: 100,
          width: 200,
          height: 50,
          text: "Double click to edit",
          fontSize: 24,
          color: theme?.properties.textColor || "#000000",
          fontFamily: "Arial",
        },
      ]);
      setSelectedId(newId);
    },
    addImage: (src) => {
      const newId = Date.now();
      setElements((prev) => [
        ...prev,
        {
          id: newId,
          type: "image",
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          src,
        },
      ]);
      setSelectedId(newId);
    },
    getCanvasElements: () => elements,
    deleteSelected: () => {
      if (selectedId !== null) {
        setElements((prev) => prev.filter((el) => el.id !== selectedId));
        setSelectedId(null);
        setEditingId(null);
      }
    },
    duplicateSelected: () => {
      if (selectedId !== null) {
        const selectedElement = elements.find((el) => el.id === selectedId);
        if (selectedElement) {
          const newId = Date.now();
          const newElement = {
            ...selectedElement,
            id: newId,
            x: selectedElement.x + 20,
            y: selectedElement.y + 20,
          };
          setElements((prev) => [...prev, newElement]);
          setSelectedId(newId);
        }
      }
    },
    downloadAsPDF: () => {
      // Create a hidden canvas
      const width = 1200;
      const height = 900;
      const hiddenCanvas = document.createElement("canvas");
      hiddenCanvas.width = width;
      hiddenCanvas.height = height;
      const ctx = hiddenCanvas.getContext("2d");
      // Fill background
      ctx.fillStyle = theme?.properties.background || "#fff";
      ctx.fillRect(0, 0, width, height);
      // Draw grid if present
      if (theme?.properties.gridColor) {
        ctx.save();
        ctx.strokeStyle = theme.properties.gridColor;
        ctx.lineWidth = 0.5;
        for (let x = 0; x < width; x += 20) {
          for (let y = 0; y < height; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
      // Draw elements
      elements.forEach((el) => {
        if (el.type === "text") {
          ctx.save();
          ctx.font = `${el.fontSize || 24}px ${el.fontFamily || "Arial"}`;
          ctx.fillStyle = el.color || "#000";
          ctx.textBaseline = "top";
          const lines = (el.text || "").split("\n");
          lines.forEach((line, idx) => {
            ctx.fillText(line, el.x, el.y + idx * (el.fontSize || 24) * 1.2);
          });
          ctx.restore();
        } else if (el.type === "image" && el.src) {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.drawImage(img, el.x, el.y, el.width, el.height);
            // If this is the last image, export PDF
            if (elements.filter((e) => e.type === "image").pop() === el) {
              exportPDF();
            }
          };
          img.onerror = exportPDF;
          img.src = el.src;
        }
      });
      // If no images, export PDF immediately
      if (!elements.some((e) => e.type === "image")) {
        exportPDF();
      }
      function exportPDF() {
        const imgData = hiddenCanvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [width, height],
        });
        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save("canvas.pdf");
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    interact(".draggable")
      .draggable({
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: "parent",
            endOnly: true,
          }),
        ],
        autoScroll: true,
        listeners: {
          start(event) {
            const id = Number(event.target.dataset.id);
            setSelectedId(id);
            setEditingId(null);
          },
          move(event) {
            const id = Number(event.target.dataset.id);
            setElements((prev) =>
              prev.map((el) =>
                el.id === id
                  ? {
                      ...el,
                      x: el.x + event.dx / zoomLevel,
                      y: el.y + event.dy / zoomLevel,
                    }
                  : el
              )
            );
          },
        },
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          start(event) {
            const id = Number(event.target.dataset.id);
            setSelectedId(id);
            setEditingId(null);
          },
          move(event) {
            const id = Number(event.target.dataset.id);
            setElements((prev) =>
              prev.map((el) =>
                el.id === id
                  ? {
                      ...el,
                      x: el.x + event.deltaRect.left / zoomLevel,
                      y: el.y + event.deltaRect.top / zoomLevel,
                      width: el.width + event.deltaRect.width / zoomLevel,
                      height: el.height + event.deltaRect.height / zoomLevel,
                    }
                  : el
              )
            );
          },
        },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 50, height: 50 },
          }),
        ],
      });

    return () => {
      interact(".draggable").unset();
    };
  }, [zoomLevel]);

  const handleElementClick = (id, e) => {
    e.stopPropagation();
    setSelectedId(id);
    setEditingId(null);
  };

  const handleCanvasClick = () => {
    setSelectedId(null);
    setEditingId(null);
  };

  const handleDoubleClick = (id, e) => {
    e.stopPropagation();
    const element = elements.find((el) => el.id === id);
    if (element && element.type === "text") {
      setEditingId(id);
      setSelectedId(id);
    }
  };

  const handleTextChange = (id, newText) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, text: newText } : el))
    );
  };

  const handleFontSizeChange = (id, newSize) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, fontSize: parseInt(newSize) || 24 } : el
      )
    );
  };

  const handleColorChange = (id, newColor) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, color: newColor } : el))
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl shadow-lg"
      style={{
        background: theme?.properties.background || "#ffffff",
        boxShadow: `0 4px 6px -1px ${
          theme?.properties.shadowColor || "rgba(0, 0, 0, 0.1)"
        }`,
      }}
      onClick={handleCanvasClick}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${
            theme?.properties.gridColor || "rgba(0, 0, 0, 0.1)"
          } 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          opacity: 0.5,
        }}
      />

      <div
        className="relative w-full h-full"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {elements.map((element) => {
          const isSelected = selectedId === element.id;
          const isEditing = editingId === element.id;

          return (
            <div
              key={element.id}
              className={`draggable absolute ${isSelected ? "ring-2" : ""}`}
              data-id={element.id}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                zIndex: isSelected ? 1000 : 1,
                cursor: isSelected ? "move" : "pointer",
                border: isSelected
                  ? `2px solid ${theme?.properties.primary || "#3b82f6"}`
                  : "none",
              }}
              onClick={(e) => handleElementClick(element.id, e)}
              onDoubleClick={(e) => handleDoubleClick(element.id, e)}
            >
              {element.type === "text" ? (
                isEditing ? (
                  <div
                    ref={editorRef}
                    className="relative bg-white rounded-lg shadow-lg"
                    style={{ zIndex: 999 }}
                  >
                    <div className="absolute top-[-40px] left-0 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-[999]">
                      <div className="flex items-center gap-2">
                        <FiType className="text-gray-500" />
                        <input
                          type="number"
                          value={element.fontSize}
                          onChange={(e) =>
                            handleFontSizeChange(element.id, e.target.value)
                          }
                          min="8"
                          max="100"
                          className="w-16 border rounded px-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <FiEdit2 className="text-gray-500" />
                        <input
                          type="color"
                          value={element.color}
                          onChange={(e) =>
                            handleColorChange(element.id, e.target.value)
                          }
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                    <textarea
                      ref={textAreaRef}
                      autoFocus
                      value={element.text}
                      onChange={(e) =>
                        handleTextChange(element.id, e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                      className="w-full h-full resize-none bg-transparent text-black border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        fontSize: `${element.fontSize}px`,
                        fontFamily: element.fontFamily,
                        color: element.color,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                    style={{
                      fontSize: `${element.fontSize}px`,
                      color: element.color,
                      fontFamily: element.fontFamily,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {element.text}
                  </div>
                )
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={element.src}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              {isSelected && !isEditing && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1 -translate-y-1" />
                  <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full transform translate-x-1 -translate-y-1" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1 translate-y-1" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full transform translate-x-1 translate-y-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
