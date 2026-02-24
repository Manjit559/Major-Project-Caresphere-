import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Mic, 
  MessageCircle, 
  CheckSquare, 
  Accessibility, 
  Menu,
  X,
  ScanFace
} from 'lucide-react';

import { AppTab, WellnessRecord } from './types';
import Dashboard from './components/Dashboard';
import WellnessImage from './components/WellnessImage';
import VoiceReflection from './components/VoiceReflection';
import ChatSupport from './components/ChatSupport';
import ProductivityCoach from './components/ProductivityCoach';
import AccessibilityMode from './components/AccessibilityMode';
import LiveEmotionScan from './components/LiveEmotionScan';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [history, setHistory] = useState<WellnessRecord[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNewRecord = (record: WellnessRecord) => {
    setHistory(prev => [...prev, record]);
  };

  const navItems = [
    { id: AppTab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppTab.IMAGE_WELLNESS, label: 'Visual Check', icon: ImageIcon },
    { id: AppTab.LIVE_EMOTION, label: 'Live Emotion Scan', icon: ScanFace },
    { id: AppTab.VOICE_REFLECTION, label: 'Voice Reflection', icon: Mic },
    { id: AppTab.CHAT_SUPPORT, label: 'Chat Support', icon: MessageCircle },
    { id: AppTab.PRODUCTIVITY, label: 'Productivity', icon: CheckSquare },
    { id: AppTab.ACCESSIBILITY, label: 'Accessibility', icon: Accessibility },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return <Dashboard history={history} />;
      case AppTab.IMAGE_WELLNESS: return <WellnessImage onRecord={handleNewRecord} />;
      case AppTab.LIVE_EMOTION: return <LiveEmotionScan onRecord={handleNewRecord} />;
      case AppTab.VOICE_REFLECTION: return <VoiceReflection onRecord={handleNewRecord} />;
      case AppTab.CHAT_SUPPORT: return <ChatSupport />;
      case AppTab.PRODUCTIVITY: return <ProductivityCoach />;
      case AppTab.ACCESSIBILITY: return <AccessibilityMode />;
      default: return <Dashboard history={history} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-teal-50 text-gray-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-teal-100 fixed inset-y-0 z-10">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-teal-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-teal-500 rounded-lg block"></span>
            Caresphere
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-teal-50 text-teal-700 font-bold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-teal-500' : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-teal-50">
          <div className="bg-teal-900 rounded-xl p-4 text-white">
            <p className="text-xs opacity-70 uppercase font-bold mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">System Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-20 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-teal-800">Caresphere</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-10 pt-16 px-4 md:hidden">
           <nav className="space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl ${
                  activeTab === item.id ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
