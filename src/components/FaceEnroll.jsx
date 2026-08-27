import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function FaceEnroll({ voterId, onEnrolled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Initializing camera...");
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream =
          await navigator.mediaDevices.getUserMedia({
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
        setMessage("Camera is ON. Position your face and click Enroll Face.");
      } catch (err) {
        console.error("Camera error:", err);
        setStatus("failed");
        setMessage(
          "Camera access failed. Please allow camera permission and retry."
        );
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const enrollFace = async () => {
    try {
      setStatus("enrolling");
      setMessage("Processing your face...");

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) {
        throw new Error("Camera is not ready.");
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageBase64 = canvas.toDataURL("image/jpeg");

      const response = await api.post("/biometrics/enroll", {
        voter_id: voterId,
        biometric_data: {
          method: "FACE",
          image_base64: imageBase64,
        },
        re_enroll: true,
      });

      console.log("Biometric enrollment:", response.data);

      setStatus("success");
      setMessage("Face successfully enrolled!");

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      setTimeout(() => {
        onEnrolled(true);
      }, 800);
    } catch (err) {
      console.error("Enrollment error:", err);

      setStatus("failed");
      setMessage(
        err.response?.data?.detail ||
        "Face enrollment failed. Please try again."
      );
    }
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
          onClick={enrollFace}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold text-white"
        >
          📸 Enroll My Face
        </button>
      )}

      {status === "enrolling" && (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      )}

      {status === "failed" && (
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold text-white"
        >
          Retry
        </button>
      )}
    </div>
  );
}