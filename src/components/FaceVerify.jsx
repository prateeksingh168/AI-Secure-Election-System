import { useEffect, useRef, useState } from "react";

export default function FaceVerify({ voterId, onVerified }) {
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
        setMessage("✅ Camera ON hai. 'Verify Face' dabao.");
      } catch (err) {
        setStatus("failed");
        setMessage("❌ Camera access nahi mila. Browser permissions check karo.");
      }
    };
    initCamera();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, []);

  const verifyFace = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Photo capture
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setStatus("verifying");
    setMessage("⏳ Face match ho raha hai... (Mock Verification)");

    // FAKE BACKEND DELAY (2 seconds)
    setTimeout(() => {
      setStatus("success");
      setMessage("✅ Face verified successfully! Aap vote de sakte hain.");
      setTimeout(() => onVerified(true), 1000);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <video ref={videoRef} muted playsInline className="w-full max-w-md rounded-2xl border-2 border-gray-700 bg-black" />
      <canvas ref={canvasRef} className="hidden" />
      <p className={`text-sm text-center ${status === "failed" ? "text-red-400" : status === "success" ? "text-green-400" : "text-gray-300"}`}>{message}</p>
      {(status === "ready" || status === "failed") && <button onClick={verifyFace} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold text-white">{status === "failed" ? "🔄 Retry Verification" : "📸 Verify Face"}</button>}
      {status === "verifying" && <div className="flex items-center gap-2 text-gray-400"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div><span>Matching...</span></div>}
    </div>
  );
}