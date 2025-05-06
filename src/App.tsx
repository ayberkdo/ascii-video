import { useEffect, useRef, useState } from "react";

const asciiChars = "@%#*+=-:. "; // Koyu -> Açık

function getAsciiChar(gray: number) {
  const index = Math.floor((gray / 255) * (asciiChars.length - 1));
  return asciiChars[index];
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [asciiFrame, setAsciiFrame] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    video?.play().catch((err) => {
      console.warn("Oynatma başarısız:", err);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      const ctx = canvas.getContext("2d");
      const width = 120; // Düşük çözünürlük
      const height = 60;

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(video, 0, 0, width, height);
      const frame = ctx?.getImageData(0, 0, width, height);
      if (!frame) return;

      const ascii = [];

      for (let y = 0; y < height; y++) {
        let row = "";
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = frame.data[i];
          const g = frame.data[i + 1];
          const b = frame.data[i + 2];
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          row += getAsciiChar(gray);
        }
        ascii.push(row);
      }

      setAsciiFrame(ascii.join("\n"));
    }, 100); // Her 100ms'de bir kare oku (yaklaşık 10fps)

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row", // YAN YANA yerleştirme
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "20px",
        padding: "20px",
        backgroundColor: "#000",
        height: "100vh",
        overflow: "auto"
      }}
    >
      <video
        ref={videoRef}
        src="video.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          display: "none", // Video öğesini gizle
          maxHeight: "100%",
          maxWidth: "50%",
          border: "2px solid #fff",
        }}
      />

      {/* ASCII Görüntü */}
      <div style={{ overflow: "hidden", maxWidth: "50%", color: "#fff" }}>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <pre
          style={{
            fontFamily: "monospace",
            lineHeight: "14px",
            letterSpacing: "1px",
            fontSize: "10px",
            whiteSpace: "pre",
            margin: 0,
          }}
        >
          {asciiFrame}
        </pre>
      </div>
    </div>
  );
}
