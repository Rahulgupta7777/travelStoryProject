import React, { use } from "react";
import anime from "animejs";

function Loader() {
  return (
    <>
      <div id="anime-demo">
        <p>
          Uploading:
          <progress
            value="0"
            max="100"
            className="ml-[10px] relative top-[3px] w-[600px]"
          >
            <div class="Progress-bar" role="presentation">
              <span className="Progress-value" style={{ width: "80%" }}>
                &nbsp;
              </span>
            </div>
          </progress>
        </p>
      </div>
      <div class="controls">
        <button class="play-progress">Animate Progress</button>
      </div>
    </>
  );
}

export default Loader;
