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
import { availableStickers } from "./_constants/stickers";

export default forwardRef(({ zoomLevel, theme }, ref) => {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const editorRef = useRef(null);
  const textAreaRef = useRef(null);
  const canvasRef = useRef(null);

  const [canvasElement, setCanvasElement] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useImperativeHandle(ref, () => ({
    addText: () => {
      const newId = Date.now();
      setCanvasElement((prev) => [
        ...prev,
        {
          id: newId,
          pos: { x: 150, y: 150 },
          size: { width: 100, height: 50 },
          type: "text",
          properties: {
            text: "New Text",
            fontSize: 20,
            color: "#000000",
            fontFamily: "Arial",
          },
        },
      ]);
      setEditingId(newId);
    },
    addImage: (imageSrc) => {
      const newId = Date.now();
      setCanvasElement((prev) => [
        ...prev,
        {
          id: newId,
          pos: { x: 200, y: 200 },
          size: { width: 100, height: 100 },
          type: "image",
          properties: {
            src: imageSrc,
          },
        },
      ]);
    },
    deleteSelected: () => {
      if (editingId !== null) {
        setCanvasElement((prev) => prev.filter((el) => el.id !== editingId));
        setEditingId(null);
      }
    },
    duplicateSelected: () => {
      if (selectedId !== null) {
        const selectedElement = canvasElement.find(
          (el) => el.id === selectedId
        );
        if (selectedElement) {
          const newId = Date.now();
          const newElement = {
            ...selectedElement,
            id: newId,
            pos: {
              x: selectedElement.pos.x + 20,
              y: selectedElement.pos.y + 20,
            },
          };
          setCanvasElement((prev) => [...prev, newElement]);
          setSelectedId(newId);
          setEditingId(null);
        }
      }
    },
    downloadAsPDF: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const promises = canvasElement.map((element) => {
        if (element.type === "text") {
          ctx.font = `${element.properties.fontSize}px ${element.properties.fontFamily}`;
          ctx.fillStyle = element.properties.color;
          ctx.textBaseline = "top";
          const lines = element.properties.text.split("\n");
          lines.forEach((line, index) => {
            ctx.fillText(
              line,
              element.pos.x,
              element.pos.y + index * element.properties.fontSize * 1.2
            );
          });
          return Promise.resolve();
        } else if (element.type === "image") {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              ctx.drawImage(
                img,
                element.pos.x,
                element.pos.y,
                element.size.width,
                element.size.height
              );
              resolve();
            };
            img.error = () => resolve();
            img.src = element.properties.src;
          });
        }
        return Promise.resolve();
      });
      Promise.all(promises).then(() => {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("canvas.pdf");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    },
    addSticker: (sticker) => {
      const newId = Date.now();
      setCanvasElement((prev) => [
        ...prev,
        {
          id: newId,
          pos: { x: 150, y: 150 },
          size: { width: 100, height: 100 },
          type: "sticker",
          properties: {
            url: sticker.url,
            name: sticker.name,
          },
        },
      ]);
      setEditingId(newId);
    },
    clearCanvas: () => {
      setCanvasElement([]);
      setEditingId(null);
    },
    canvasElement,
  }));

  const measureTextSize = (text, fontSize, fontFamily) => {
    if (measureRef.current) {
      measureRef.current.style.fontSize = `${fontSize}px`;
      measureRef.current.style.fontFamily = fontFamily;
      measureRef.current.textContent = text || " ";
      const rect = measureRef.current.getBoundingClientRect();
      return {
        width: Math.max(rect.width / zoomLevel, 50),
        height: Math.max(rect.height / zoomLevel, 20),
      };
    }
    return { width: 100, height: 50 };
  };

  const handleTextChange = (id, newText) => {
    setCanvasElement((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          const { fontSize, fontFamily } = el.properties;
          const newSize = measureTextSize(newText, fontSize, fontFamily);
          return {
            ...el,
            properties: { ...el.properties, text: newText },
            size: newSize,
          };
        }
        return el;
      })
    );
  };

  const handleFontSizeChange = (id, newFontSize) => {
    const fontSize = Math.max(8, Math.min(100, parseInt(newFontSize) || 20));
    setCanvasElement((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          const { text, fontFamily } = el.properties;
          const newSize = measureTextSize(text, fontSize, fontFamily);
          return {
            ...el,
            properties: { ...el.properties, fontSize },
            size: newSize,
          };
        }
        return el;
      })
    );
  };

  const handleColorChange = (id, newColor) => {
    setCanvasElement((prev) =>
      prev.map((el) =>
        el.id === id
          ? { ...el, properties: { ...el.properties, color: newColor } }
          : el
      )
    );
  };

  const handleBlurOrEnter = (id, e) => {
    if (e.type === "keydown" && e.key === "Enter") {
      setEditingId(null);
      e.preventDefault();
    } else if (e.type === "blur") {
      const relatedTarget = e.relatedTarget;
      if (
        relatedTarget &&
        editorRef.current &&
        editorRef.current.contains(relatedTarget)
      ) {
        return;
      }
      setEditingId(null);
    }
  };

  const handleElementClick = (id, e) => {
    e.stopPropagation();
    setSelectedId(id);
    if (e.detail === 2) {
      const element = canvasElement.find((el) => el.id === id);
      if (element && element.type === "text") {
        setEditingId(id);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        editingId !== null &&
        editorRef.current &&
        !editorRef.current.contains(e.target)
      ) {
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingId]);

  useEffect(() => {
    if (editingId !== null && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    interact(".draggable").unset();
    interact(".draggable")
      .draggable({
        ignoreFrom: ".no-drag",
        inertia: true,
        autoScroll: true,
        listeners: {
          start(event) {
            const target = event.target;
            const rect = target.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            target.dataset.offsetX = (event.clientX - rect.left) / zoomLevel;
            target.dataset.offsetY = (event.clientY - rect.top) / zoomLevel;
            target.dataset.containerX = containerRect.left;
            target.dataset.containerY = containerRect.top;

            const transform = window.getComputedStyle(target).transform;
            const matrix = new DOMMatrix(transform);
            target.dataset.x = matrix.m41;
            target.dataset.y = matrix.m42;
          },
          move(event) {
            const target = event.target;
            const id = Number(target.dataset.id);

            const offsetX = parseFloat(target.dataset.offsetX) || 0;
            const offsetY = parseFloat(target.dataset.offsetY) || 0;
            const containerX = parseFloat(target.dataset.containerX) || 0;
            const containerY = parseFloat(target.dataset.containerY) || 0;

            let x = parseFloat(target.dataset.x) || 0;
            let y = parseFloat(target.dataset.y) || 0;

            x += event.dx / zoomLevel;
            y += event.dy / zoomLevel;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.dataset.x = x;
            target.dataset.y = y;

            const newX =
              (event.clientX - containerX - offsetX * zoomLevel) / zoomLevel;
            const newY =
              (event.clientY - containerY - offsetY * zoomLevel) / zoomLevel;

            setCanvasElement((prev) =>
              prev.map((el) =>
                el.id === id ? { ...el, pos: { x: newX, y: newY } } : el
              )
            );
          },
        },
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const id = Number(event.target.dataset.id);
            const delta = event.deltaRect;

            const target = event.target;
            let x = parseFloat(target.dataset.x) || 0;
            let y = parseFloat(target.dataset.y) || 0;

            x += delta.left / zoomLevel;
            y += delta.top / zoomLevel;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.dataset.x = x;
            target.dataset.y = y;

            setCanvasElement((prev) =>
              prev.map((el) =>
                el.id === id
                  ? {
                      ...el,
                      pos: {
                        x: el.pos.x + delta.left / zoomLevel,
                        y: el.pos.y + delta.top / zoomLevel,
                      },
                      size: {
                        width: el.size.width + delta.width / zoomLevel,
                        height: el.size.height + delta.height / zoomLevel,
                      },
                    }
                  : el
              )
            );
          },
        },
        modifiers: [
          interact.modifiers.restrictSize({ min: { width: 50, height: 20 } }),
        ],
        inertia: true,
      });
    return () => {
      interact(".draggable").unset();
    };
  }, [zoomLevel]);

  return (
    <div
      className="w-full h-full overflow-auto flex justify-center items-center"
      style={{
        background: theme?.properties?.background || "#f3f4f6",
        color: theme?.properties?.textColor || "#000000",
      }}
    >
      <div className="flex justify-center items-center w-full h-full">
        <div
          ref={containerRef}
          style={{
            width: 1800,
            height: 1600,
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
            position: "relative",
          }}
        >
          <canvas
            ref={canvasRef}
            width={1800}
            height={1600}
            className="border-2 border-gray-400"
            style={{
              background: theme?.properties?.canvasBackground || "#ffffff",
            }}
          />
          <div className="absolute top-0 left-0">
            {canvasElement.map((element) => {
              if (element.type === "text") {
                return (
                  <div
                    key={element.id}
                    className="draggable"
                    data-id={element.id}
                    style={{
                      position: "absolute",
                      left: element.pos.x,
                      top: element.pos.y,
                      width: element.size.width,
                      height: element.size.height,
                      cursor: "move",
                      userSelect: "none",
                      zIndex: 5,
                      transform: `translate(${element.pos.x}px, ${element.pos.y}px)`,
                    }}
                    onClick={(e) => handleElementClick(element.id, e)}
                  >
                    {editingId === element.id ? (
                      <div
                        ref={editorRef}
                        className="no-drag"
                        style={{ position: "relative", zIndex: 999 }}
                      >
                        <div
                          className="absolute top-[-60px] left-0 p-3 flex gap-4 z-[999]"
                          style={{
                            background:
                              theme?.properties?.background || "#ffffff",
                            border: `2px solid ${
                              theme?.properties?.primary || "#e5e7eb"
                            }`,
                            color: theme?.properties?.textColor || "#000000",
                            borderRadius: "8px",
                          }}
                        >
                          <label className="text-base">
                            Font Size:
                            <input
                              type="number"
                              value={element.properties.fontSize}
                              onChange={(e) =>
                                handleFontSizeChange(element.id, e.target.value)
                              }
                              min="8"
                              max="100"
                              className="ml-2 w-16 border-2 px-2 py-1 text-base rounded"
                              style={{
                                borderColor:
                                  theme?.properties?.primary || "#e5e7eb",
                                color:
                                  theme?.properties?.textColor || "#000000",
                              }}
                            />
                          </label>
                          <label className="text-base">
                            Color:
                            <input
                              type="color"
                              value={element.properties.color}
                              onChange={(e) =>
                                handleColorChange(element.id, e.target.value)
                              }
                              className="ml-2 w-8 h-8 rounded cursor-pointer"
                            />
                          </label>
                        </div>
                        <textarea
                          ref={textAreaRef}
                          autoFocus
                          value={element.properties.text}
                          onChange={(e) =>
                            handleTextChange(element.id, e.target.value)
                          }
                          onBlur={(e) => handleBlurOrEnter(element.id, e)}
                          onKeyDown={(e) => handleBlurOrEnter(element.id, e)}
                          className="w-full h-full resize-none bg-transparent border-2 p-3 text-base outline-none rounded"
                          style={{
                            fontSize: `${element.properties.fontSize}px`,
                            fontFamily: element.properties.fontFamily,
                            color: element.properties.color,
                            borderColor:
                              theme?.properties?.primary || "#e5e7eb",
                            lineHeight: "1.5",
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: `${element.properties.fontSize}px`,
                          color: element.properties.color,
                          fontFamily: element.properties.fontFamily,
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.5",
                          padding: "8px",
                        }}
                      >
                        {element.properties.text}
                      </div>
                    )}
                  </div>
                );
              } else if (element.type === "image") {
                return (
                  <div
                    key={element.id}
                    className="draggable"
                    data-id={element.id}
                    style={{
                      position: "absolute",
                      left: element.pos.x,
                      top: element.pos.y,
                      width: element.size.width,
                      height: element.size.height,
                      cursor: "move",
                      userSelect: "none",
                      zIndex: 2,
                      padding: "8px",
                    }}
                  >
                    <img
                      src={element.properties.src}
                      alt=""
                      width={element.size.width}
                      height={element.size.height}
                      className="pointer-events-none select-none rounded"
                    />
                  </div>
                );
              } else if (element.type === "sticker") {
                return (
                  <div
                    key={element.id}
                    className="draggable"
                    data-id={element.id}
                    style={{
                      position: "absolute",
                      left: element.pos.x,
                      top: element.pos.y,
                      width: element.size.width,
                      height: element.size.height,
                      cursor: "move",
                      userSelect: "none",
                      zIndex: 2,
                      padding: "8px",
                    }}
                  >
                    <img
                      src={element.properties.url}
                      alt={element.properties.name}
                      width={element.size.width}
                      height={element.size.height}
                      className="pointer-events-none select-none rounded"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
          <div
            ref={measureRef}
            style={{
              position: "absolute",
              visibility: "hidden",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "16px",
              lineHeight: "1.5",
            }}
          />
        </div>
      </div>
    </div>
  );
});
