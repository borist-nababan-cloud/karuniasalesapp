import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, RefreshCw } from "lucide-react";

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [error, setError] = useState<string | null>(null);

    const startCamera = async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            setError(null);
        } catch (err: any) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please check permissions.");
        }
    };

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [facingMode]);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        if (context) {
            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to Blob/File
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
                    onCapture(file);
                    // Stop stream after capture
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                    }
                }
            }, "image/jpeg", 0.8);
        }
    };

    const switchCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Close Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={onClose}
            >
                <X className="h-6 w-6" />
            </Button>

            {/* Error Message */}
            {error && (
                <div className="absolute top-20 bg-red-500 text-white px-4 py-2 rounded">
                    {error}
                </div>
            )}

            {/* Video Preview */}
            <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover md:object-contain" // Cover on mobile, contain on desktop
                />
            </div>

            {/* Controls Bar */}
            <div className="absolute bottom-10 w-full flex justify-around items-center px-8">
                {/* Switch Camera */}
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-black/40 border-white/40 text-white hover:bg-black/60"
                    onClick={switchCamera}
                >
                    <RefreshCw className="h-5 w-5" />
                </Button>

                {/* Shutter Button */}
                <button
                    onClick={handleCapture}
                    className="h-20 w-20 rounded-full bg-white border-4 border-gray-300 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                    <div className="h-16 w-16 rounded-full bg-white border-2 border-black" />
                </button>

                {/* Placeholder for symmetry or Gallery Link could go here */}
                <div className="w-10" />
            </div>

            {/* Hidden Canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
