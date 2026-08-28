import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function FaceVerify({ voterId, onVerified }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
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

  const verifyFace = async () => {
    try {
      setStatus("verifying");
      setMessage("Processing verification frame...");

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) {
        throw new Error("Camera not initialized");
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageBase64 = canvas.toDataURL("image/jpeg");

      // API call to real-time biometric verify
      const response = await api.post("/biometrics/verify", {
        voter_id: voterId,
        biometric_data: {
          method: "FACE",
          image_base64: imageBase64,
        },
      });

      console.log("Biometric verification response:", response.data);

      if (response.data.verified) {
        localStorage.setItem("biometric_token", response.data.biometric_token);
        setStatus("success");
        setMessage("Identity verified successfully!");

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setTimeout(() => {
          onVerified(true);
        }, 800);
      } else {
        throw new Error("Face verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("failed");
      setMessage(
        err.response?.data?.detail ||
        err.message ||
        "Biometric verification failed. Please try again."
      );
    }
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

      <canvas ref={canvasRef} className="hidden" />

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