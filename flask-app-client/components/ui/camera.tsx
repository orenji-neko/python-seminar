"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "./button";
import { Camera, RefreshCw, Check, X } from "lucide-react";

interface CameraComponentProps {
  onCapture: (file: File) => void;
}

export default function CameraComponent({ onCapture }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        
        // Convert dataUrl to File
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "profile_image.jpg", { type: "image/jpeg" });
            onCapture(file);
          });
      }
    }
  }, [onCapture]);

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-2">
        {!capturedImage ? (
          <Button type="button" onClick={capturePhoto} variant="secondary">
            <Camera className="mr-2 h-4 w-4" />
            Capture Photo
          </Button>
        ) : (
          <Button type="button" onClick={retake} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retake
          </Button>
        )}
      </div>
    </div>
  );
}
