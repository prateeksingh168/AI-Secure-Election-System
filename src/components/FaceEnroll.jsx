import { useEffect, useRef, useState } from "react";

export default function FaceEnroll({ voterId, onEnrolled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Camera initialize ho raha hai...");
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        // REAL CAMERA OPEN
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        await videoRef.current.play();
        setStatus("ready");
        setMessage("✅ Camera ON hai. Apna face frame me rakho aur 'Enroll Face' dabao.");
      } catch (err) {
        setStatus("failed");
        setMessage("❌ Camera access nahi mila. Browser me Camera permission allow karo.");
      }
    };
    initCamera();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, []);

  const enrollFace = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Photo capture
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setStatus("enrolling");
    setMessage("⏳ Face scan ho raha hai... Backend ko bheja ja raha hai (Mock Mode).");

    // FAKE BACKEND DELAY (2 seconds)
    setTimeout(() => {
      setStatus("success");
      setMessage("✅ Face successfully enrolled! Ab verification ke liye aage badho.");
      setTimeout(() => onEnrolled(true), 1500);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <video ref={videoRef} muted playsInline className="w-full max-w-md rounded-2xl border-2 border-gray-700 bg-black" />
      <canvas ref={canvasRef} className="hidden" />
      <p className={`text-sm text-center ${status === "failed" ? "text-red-400" : status === "success" ? "text-green-400" : "text-gray-300"}`}>{message}</p>
      {status === "ready" && <button onClick={enrollFace} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold text-white">📸 Enroll My Face</button>}
      {status === "enrolling" && <div className="flex items-center gap-2 text-gray-400"><div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div><span>Processing...</span></div>}
    </div>
  );
}