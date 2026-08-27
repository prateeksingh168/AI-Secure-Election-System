import { useEffect, useRef, useState } from "react";

export default function FaceVerify({ voterId, onVerified }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Initializing camera...");
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let mediaStream = null;

    const initCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: 640,
            height: 480,
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        setStream(mediaStream);
        setStatus("ready");
        setMessage(
          "Camera is ready. Keep your face visible and click Verify Face."
        );
      } catch (error) {
        console.error("Camera error:", error);
        setStatus("failed");
        setMessage(
          "Camera access failed. Please allow camera access and retry."
        );
      }
    };

    initCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const verifyFace = () => {
    setStatus("verifying");
    setMessage("Verifying identity...");

    // Prototype/Demo verification mode.
    // Real biometric verification will be connected later.
    setTimeout(() => {
      setStatus("success");
      setMessage("Face verification successful.");

      setTimeout(() => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        onVerified(true);
      }, 700);
    }, 1000);
  };

  const retry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <video
        ref={videoRef}
        muted
        playsInline
        className="w-full max-w-md rounded-2xl border-2 border-gray-700 bg-black"
      />

      <p
        className={`text-sm text-center ${status === "failed"
          ? "text-red-400"
          : status === "success"
            ? "text-green-400"
            : "text-gray-300"
          }`}
      >
        {message}
      </p>

      {status === "ready" && (
        <button
          onClick={verifyFace}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold text-white"
        >
          Verify Face
        </button>
      )}

      {status === "verifying" && (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying...</span>
        </div>
      )}

      {status === "success" && (
        <div className="bg-green-900/30 border border-green-700 text-green-300 px-5 py-3 rounded-lg">
          ✓ Identity verified successfully
        </div>
      )}

      {status === "failed" && (
        <button
          onClick={retry}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold text-white"
        >
          Retry
        </button>
      )}
    </div>
  );
}