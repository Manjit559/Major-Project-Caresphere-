import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WellnessRecord } from '../types';

interface DashboardProps {
  history: WellnessRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const chartData = useMemo(() => {
    if (history.length === 0) {
      return [
        { name: 'Mon', score: 65 },
        { name: 'Tue', score: 70 },
        { name: 'Wed', score: 60 },
        { name: 'Thu', score: 75 },
        { name: 'Fri', score: 85 },
        { name: 'Sat', score: 80 },
        { name: 'Sun', score: 90 },
      ];
    }
    return history.map((rec, i) => ({
      name: rec.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: rec.score,
    })).slice(-7);
  }, [history]);

  const averageScore = useMemo(() => {
    if (history.length === 0) return 75;
    const sum = history.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / history.length);
  }, [history]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-teal-800">Your Wellness Journey</h2>
        <p className="text-teal-600">Track your mood and progress over time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-teal-100">
          <h3 className="text-xl font-semibold text-teal-800 mb-2">Average Mood Score</h3>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-teal-500">{averageScore}</span>
            <span className="text-gray-400 mb-1">/ 100</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Based on your recent check-ins</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-teal-100">
          <h3 className="text-xl font-semibold text-teal-800 mb-2">Recent Activity</h3>
          <p className="text-gray-600">
            {history.length > 0 
              ? `You have completed ${history.length} check-ins this session.` 
              : "No check-ins yet. Try the Image or Voice tools!"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-teal-100 p-6 flex flex-col h-96">
        <h3 className="text-xl font-semibold text-teal-800 mb-4">Mood Trend</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Area type="monotone" dataKey="score" stroke="#0d9488" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
