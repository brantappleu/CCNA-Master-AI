import React, { useState } from 'react';
import { ViewState } from '../types';
import { 
  BookOpen, 
  Terminal, 
  LayoutDashboard, 
  PenTool, 
  Cloud, 
  Settings, 
  LogOut,
  Menu,
  X,
  Trophy
} from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, onLogout, children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('GEMINI_API_KEY') || '');

  const saveApiKey = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKeyInput);
    setShowApiKeyModal(false);
    window.location.reload(); // Simple reload to pick up new key
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setView(view);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-6 py-4 transition-colors ${
        currentView === view 
          ? 'bg-blue-600 text-white border-r-4 border-white' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-slate-900 flex items-center justify-between px-4 z-50">
        <span className="text-white font-bold">CCNA Master AI</span>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-40 h-full w-64 bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-800 hidden md:block">
            <h1 className="text-xl font-bold text-white tracking-wider flex items-center">
              <span className="text-blue-500 mr-2">Cisco</span> AI
            </h1>
            <p className="text-xs text-slate-500 mt-1">v2.1.0-CAN</p>
          </div>

          <nav className="flex-1 mt-6 md:mt-0 pt-16 md:pt-6">
            <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem view={ViewState.STUDY} icon={BookOpen} label="Study Modules" />
            <NavItem view={ViewState.LAB} icon={Terminal} label="Lab Simulator" />
            <div className="my-2 border-t border-slate-800 mx-4"></div>
            <NavItem view={ViewState.EXAM} icon={PenTool} label="Practice Drills" />
            <NavItem view={ViewState.FULL_EXAM} icon={Trophy} label="Full Simulator" />
            <div className="my-2 border-t border-slate-800 mx-4"></div>
            <NavItem view={ViewState.DEPLOY} icon={Cloud} label="Deployment" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm w-full p-2 mb-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings / API Key</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm w-full p-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">API Key Configuration</h2>
            <p className="text-sm text-slate-600 mb-4">
              To use the Gemini AI features, please provide your Google GenAI API Key.
              This is stored locally in your browser.
            </p>
            <input 
              type="password"
              className="w-full border p-2 rounded mb-4"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={saveApiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save & Reload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;