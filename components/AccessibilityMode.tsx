import React, { useState } from 'react';
import { Accessibility, Send } from 'lucide-react';
import { simplifyContent } from '../services/gemini';

const AccessibilityMode: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimplify = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const response = await simplifyContent(input);
      setResult(response);
    } catch (err) {
      console.error('Simplification error:', err);
      setResult({ simplified: 'Could not simplify text. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-teal-800 flex items-center gap-2">
          <Accessibility className="w-8 h-8" />
          Accessibility Mode
        </h2>
        <p className="text-teal-600">Simplify text and get sign language assistance.</p>
      </header>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border border-teal-100 p-8">
        <label className="block mb-2 font-semibold text-teal-800">Paste text to simplify:</label>
        <div className="flex flex-col gap-2 mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text here..."
            rows={5}
            className="w-full px-4 py-3 border border-teal-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <button
            onClick={handleSimplify}
            disabled={loading || !input.trim()}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Simplifying...' : 'Simplify'}
          </button>
        </div>

        {result && (
          <div className="p-6 bg-teal-50 rounded-2xl border border-teal-200 space-y-4">
            <div>
              <h3 className="font-bold text-teal-800 mb-2">Simplified Text</h3>
              <p className="text-gray-700">{result.simplified}</p>
            </div>
            
            {result.signLanguageGloss && (
              <div>
                <h3 className="font-bold text-teal-800 mb-2">Sign Language Gloss</h3>
                <p className="text-gray-700 italic">{result.signLanguageGloss}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityMode;
