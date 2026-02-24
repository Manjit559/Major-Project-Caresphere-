import React, { useState, useRef } from 'react';
import { Mic, Send } from 'lucide-react';
import { analyzeVoiceReflection } from '../services/gemini';
import { WellnessRecord } from '../types';

interface VoiceReflectionProps {
  onRecord: (record: WellnessRecord) => void;
}

const VoiceReflection: React.FC<VoiceReflectionProps> = ({ onRecord }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const response = await analyzeVoiceReflection(base64, 'audio/wav');
        setResult(response);
        
        if (response.wellnessScore) {
          onRecord({
            date: new Date(),
            score: response.wellnessScore,
            type: 'voice'
          });
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error('Voice analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-teal-800 flex items-center gap-2">
          <Mic className="w-8 h-8" />
          Voice Reflection
        </h2>
        <p className="text-teal-600">Share your thoughts and feelings via voice.</p>
      </header>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border border-teal-100 p-8">
        <div className="flex gap-4 mb-6">
          {!recording ? (
            <button
              onClick={startRecording}
              className="flex-1 bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Stop Recording
            </button>
          )}
        </div>

        {audioBlob && (
          <>
            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full mb-4" />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Analyzing...' : 'Analyze Voice'}
            </button>
          </>
        )}

        {result && (
          <div className="mt-8 p-6 bg-teal-50 rounded-2xl border border-teal-200">
            <h3 className="font-bold text-teal-800 mb-2">Analysis Result</h3>
            <p className="text-teal-700 mb-4">{result.tone}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Anxiety Level</p>
                <p className="text-2xl font-bold text-teal-600">{result.anxietyLevel || 0}/10</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="text-2xl font-bold text-teal-600">{result.confidenceLevel || 0}/10</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceReflection;
