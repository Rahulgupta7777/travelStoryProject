import express from "express";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.post("/api/render-video", async (req, res) => {
  try {
    console.log("Received render request");
    const { elements } = req.body;

    if (!elements || !Array.isArray(elements)) {
      throw new Error("Invalid elements data received");
    }

    console.log("Elements received:", JSON.stringify(elements, null, 2));

    console.log("Bundling Remotion composition...");
    const bundled = await bundle(path.join(__dirname, "remotion/index.ts"));
    console.log("Bundle created successfully");

    console.log("Getting compositions...");
    const compositions = await getCompositions(bundled);
    const composition = compositions.find((c) => c.id === "CanvasAnim");
    console.log("Found composition:", composition ? "Yes" : "No");

    if (!composition) {
      throw new Error("Could not find composition");
    }

    const outputPath = path.join(__dirname, "out", "video.mp4");
    console.log("Starting video render to:", outputPath);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: { elements },
    });
    console.log("Video render completed");

    console.log("Sending video file...");
    res.download(outputPath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res
          .status(500)
          .json({ error: "Failed to send video file", details: err.message });
      }
    });
  } catch (error) {
    console.error("Error rendering video:", error);
    res.status(500).json({
      error: "Failed to render video",
      details: error.message,
      stack: error.stack,
    });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
