import { AbsoluteFill, useCurrentFrame, interpolate, Img } from "remotion";

interface ElementData {
  type: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  fontSize?: number;
  text?: string;
  url?: string;
}

export const CanvasVideo: React.FC<{ elements: ElementData[] }> = ({ elements }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      {elements.map((el, i) => {
        const delay = i * 10;
        const fadeStart = delay;
        const fadeEnd = delay + 30;

        const opacity = interpolate(
          frame,
          [fadeStart, fadeEnd],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const scale = interpolate(
          frame,
          [fadeStart, fadeEnd],
          [0.5, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const style: React.CSSProperties = {
          position: "absolute",
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          opacity: opacity,
          transform: `scale(${scale})`,
        };

        if (el.type === "text") {
          return (
            <div
              key={i}
              style={{
                ...style,
                color: el.color,
                fontSize: el.fontSize,
              }}
            >
              {el.text}
            </div>
          );
        } else {
          return <Img key={i} src={el.url!} style={style} />;
        }
      })}
    </AbsoluteFill>
  );
}; 