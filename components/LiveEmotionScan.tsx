import React, { useState, useRef } from 'react';
import { ScanFace, Send } from 'lucide-react';
import { detectRealtimeEmotions } from '../services/gemini';
import { WellnessRecord } from '../types';

interface LiveEmotionScanProps {
  onRecord: (record: WellnessRecord) => void;
}

const LiveEmotionScan: React.FC<LiveEmotionScanProps> = ({ onRecord }) => {
  const [streaming, setStreaming] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      setStreaming(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        const result = await detectRealtimeEmotions(base64, 'image/jpeg');
        setEmotion(result.emotion);
        
        onRecord({
          date: new Date(),
          score: Math.round(result.confidence * 100),
          type: 'emotion'
        });
      }
    } catch (err) {
      console.error('Emotion detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-teal-800 flex items-center gap-2">
          <ScanFace className="w-8 h-8" />
          Live Emotion Scan
        </h2>
        <p className="text-teal-600">Real-time emotion detection using your camera.</p>
      </header>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border border-teal-100 p-8">
        <div className="bg-gray-900 rounded-2xl overflow-hidden mb-6 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-96 object-cover"
          />
          <canvas ref={canvasRef} hidden />
        </div>

        <div className="flex gap-4 mb-6">
          {!streaming ? (
            <button
              onClick={startStream}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopStream}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700"
            >
              Stop Camera
            </button>
          )}
        </div>

        {streaming && (
          <button
            onClick={captureAndAnalyze}
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Detecting...' : 'Detect Emotion'}
          </button>
        )}

        {emotion && (
          <div className="mt-8 p-6 bg-teal-50 rounded-2xl border border-teal-200 text-center">
            <h3 className="font-bold text-teal-800 mb-2">Detected Emotion</h3>
            <p className="text-4xl font-bold text-teal-600">{emotion}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveEmotionScan;
