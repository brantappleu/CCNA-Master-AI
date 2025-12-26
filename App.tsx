import React, { useState } from 'react';
import { ViewState } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudyModule from './components/StudyModule';
import LabSimulator from './components/LabSimulator';
import MockExam from './components/MockExam';
import DeploymentGuide from './components/DeploymentGuide';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.STUDY:
        return <StudyModule />;
      case ViewState.LAB:
        return <LabSimulator />;
      case ViewState.EXAM:
        return <MockExam />;
      case ViewState.DEPLOY:
        return <DeploymentGuide />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      onLogout={() => setIsAuthenticated(false)}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;