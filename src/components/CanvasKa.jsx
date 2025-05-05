import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import interact from "interactjs";
import { jsPDF } from "jspdf";

export default forwardRef(({ zoomLevel }, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const editorRef = useRef(null);

  const [canvasElement, setCanvasElement] = useState([]);
  const [editingId, setEditingId] = useState(null);

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
            img.onerror = () => resolve();
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

  const handleDoubleClick = (id) => {
    setEditingId(id);
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingId]);

  useEffect(() => {
    interact(".draggable").unset();
    interact(".draggable").draggable({
      listeners: {
        start(event) {
          const target = event.target;
          const rect = target.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          target.dataset.offsetX = (event.clientX - rect.left) / zoomLevel;
          target.dataset.offsetY = (event.clientY - rect.top) / zoomLevel;
          target.dataset.containerX = containerRect.left;
          target.dataset.containerY = containerRect.top;
        },
        move(event) {
          const target = event.target;
          const id = Number(target.dataset.id);
          const offsetX = parseFloat(target.dataset.offsetX) || 0;
          const offsetY = parseFloat(target.dataset.offsetY) || 0;
          const containerX = parseFloat(target.dataset.containerX) || 0;
          const containerY = parseFloat(target.dataset.containerY) || 0;

          const newX =
            (event.clientX - containerX - offsetX * zoomLevel) / zoomLevel;
          const newY =
            (event.clientY - containerY - offsetY * zoomLevel) / zoomLevel;

          setCanvasElement((prev) =>
            prev.map((el) =>
              el.id === id
                ? {
                    ...el,
                    pos: {
                      x: newX,
                      y: newY,
                    },
                  }
                : el
            )
          );
        },
      },
    });

    return () => {
      interact(".draggable").unset();
    };
  }, [zoomLevel]);

  return (
    <div className="w-full h-full overflow-auto bg-gray-100 flex justify-center items-center">
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
            className="border border-gray-400 bg-white"
          />
          <div
            className="draggable-container"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
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
                    }}
                    onDoubleClick={() => handleDoubleClick(element.id)}
                  >
                    {editingId === element.id ? (
                      <div ref={editorRef} style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            top: -50,
                            left: 0,
                            background: "white",
                            border: "1px solid #ccc",
                            padding: "5px",
                            display: "flex",
                            gap: "10px",
                            zIndex: 10,
                          }}
                        >
                          <label>
                            Font Size:
                            <input
                              type="number"
                              value={element.properties.fontSize}
                              onChange={(e) =>
                                handleFontSizeChange(element.id, e.target.value)
                              }
                              min="8"
                              max="100"
                              style={{ width: "60px", marginLeft: "5px" }}
                            />
                          </label>
                          <label>
                            Color:
                            <input
                              type="color"
                              value={element.properties.color}
                              onChange={(e) =>
                                handleColorChange(element.id, e.target.value)
                              }
                              style={{ marginLeft: "5px" }}
                            />
                          </label>
                        </div>
                        <textarea
                          value={element.properties.text}
                          onChange={(e) =>
                            handleTextChange(element.id, e.target.value)
                          }
                          onBlur={(e) => handleBlurOrEnter(element.id, e)}
                          onKeyDown={(e) => handleBlurOrEnter(element.id, e)}
                          autoFocus
                          style={{
                            width: `${element.size.width}px`,
                            height: `${element.size.height}px`,
                            fontSize: `${element.properties.fontSize}px`,
                            color: element.properties.color,
                            fontFamily: element.properties.fontFamily,
                            border: "1px solid #ccc",
                            resize: "none",
                            padding: "2px",
                            background: "transparent",
                            boxSizing: "border-box",
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
                    }}
                  >
                    <img
                      src={element.properties.src}
                      alt="image"
                      data-id={element.id}
                      width={element.size.width}
                      height={element.size.height}
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre-wrap",
          maxWidth: "1800px",
          lineHeight: "normal",
        }}
      />
    </div>
  );
});
