import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Send } from 'lucide-react';
import { analyzeImageWellness } from '../services/gemini';
import { WellnessRecord } from '../types';

interface WellnessImageProps {
  onRecord: (record: WellnessRecord) => void;
}

const WellnessImage: React.FC<WellnessImageProps> = ({ onRecord }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setLoading(true);
    
    try {
      const base64 = preview.split(',')[1];
      const response = await analyzeImageWellness(base64, 'image/jpeg');
      setResult(response);
      
      if (response.wellnessScore) {
        onRecord({
          date: new Date(),
          score: response.wellnessScore,
          type: 'image'
        });
      }
    } catch (err) {
      console.error('Image analysis error:', err);
      setResult({ feedback: 'Error analyzing image' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-teal-800 flex items-center gap-2">
          <ImageIcon className="w-8 h-8" />
          Visual Wellness Check
        </h2>
        <p className="text-teal-600">Upload an image for a wellness assessment.</p>
      </header>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border border-teal-100 p-8">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-teal-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-teal-50 transition"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-w-full h-64 object-cover mx-auto rounded-lg" />
          ) : (
            <div className="text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-teal-400" />
              <p className="font-semibold">Click to upload an image</p>
            </div>
          )}
        </div>
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {preview && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-6 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        )}

        {result && (
          <div className="mt-8 p-6 bg-teal-50 rounded-2xl border border-teal-200">
            <h3 className="font-bold text-teal-800 mb-2">Analysis Result</h3>
            <p className="text-teal-700 mb-4">{result.feedback}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Wellness Score</p>
                <p className="text-2xl font-bold text-teal-600">{result.wellnessScore || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Happiness Level</p>
                <p className="text-2xl font-bold text-teal-600">{result.happinessLevel || 0}/10</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessImage;
