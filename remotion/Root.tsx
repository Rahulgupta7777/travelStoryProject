import React from "react";
import { Composition } from "remotion";
import { CanvasVideo } from "./Composition";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CanvasAnim"
      component={CanvasVideo}
      durationInFrames={150}
      fps={30}
      width={800}
      height={600}
      defaultProps={{ elements: [] }}
    />
  </>
); 