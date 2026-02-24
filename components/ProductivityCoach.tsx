import React, { useState } from 'react';
import { CheckSquare, Send } from 'lucide-react';
import { generateProductivityPlan } from '../services/gemini';

const ProductivityCoach: React.FC = () => {
  const [input, setInput] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const response = await generateProductivityPlan(input);
      setPlan(response);
    } catch (err) {
      console.error('Plan generation error:', err);
      setPlan({ advice: 'Could not generate plan. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-teal-800 flex items-center gap-2">
          <CheckSquare className="w-8 h-8" />
          Productivity Coach
        </h2>
        <p className="text-teal-600">Get AI-powered daily plans tailored to your goals.</p>
      </header>

     <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border border-teal-100 p-8">
        <label className="block mb-2 font-semibold text-teal-800">What would you like to accomplish today?</label>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g., Exercise, finish project, learn Spanish..."
            className="flex-1 px-4 py-3 border border-teal-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Generate
          </button>
        </div>

        {plan && (
          <div className="p-6 bg-teal-50 rounded-2xl border border-teal-200">
            <h3 className="font-bold text-teal-800 mb-4">Your Daily Plan</h3>
            <p className="text-teal-700 mb-4">{plan.advice}</p>
            
            {plan.tasks && plan.tasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-teal-800">Tasks:</h4>
                {plan.tasks.map((task: any, i: number) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-teal-100">
                    <span className="font-semibold text-teal-600">{task.time}</span>
                    <p className="text-gray-700">{task.task}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductivityCoach;
