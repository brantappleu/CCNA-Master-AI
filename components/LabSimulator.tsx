import React, { useState, useEffect, useRef } from 'react';
import { LAB_SCENARIOS } from '../constants';
import { GoogleGenAI, Chat } from "@google/genai";
import { GeminiModel } from '../types';

const LabSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<{ type: 'input' | 'output' | 'system', text: string }[]>([]);
  const [inputCommand, setInputCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Initialize Lab
  const startLab = async (scenarioId: string) => {
    const scenario = LAB_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    setSelectedScenario(scenarioId);
    setTerminalOutput([]);
    setIsSuccess(false);
    setIsProcessing(true);

    try {
      const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
      if (!apiKey) throw new Error("API Key required");

      const ai = new GoogleGenAI({ apiKey });
      
      // Initialize chat with system instruction
      chatSession.current = ai.chats.create({
        model: GeminiModel.FLASH,
        config: {
           systemInstruction: "You are a realistic Cisco IOS Network Device simulator.",
        }
      });

      // Send initial prompt to set the scene
      const response = await chatSession.current.sendMessage({ message: scenario.initialPrompt });
      
      setTerminalOutput([
        { type: 'system', text: `Scenario: ${scenario.title}` },
        { type: 'system', text: `Objective: ${scenario.objective}` },
        { type: 'system', text: '--- Terminal Connected ---' },
        { type: 'output', text: response.text || '' }
      ]);
    } catch (error) {
       setTerminalOutput(prev => [...prev, { type: 'system', text: "Error initializing lab. Check API Key." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim() || !chatSession.current || isProcessing) return;

    const cmd = inputCommand;
    setInputCommand('');
    setTerminalOutput(prev => [...prev, { type: 'input', text: cmd }]);
    setIsProcessing(true);

    try {
      const response = await chatSession.current.sendMessage({ message: cmd });
      const responseText = response.text || '';
      
      setTerminalOutput(prev => [...prev, { type: 'output', text: responseText }]);

      if (responseText.includes("LAB_SUCCESS")) {
        setIsSuccess(true);
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, { type: 'system', text: "Connection interrupted." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Scenario List */}
      <div className="lg:w-1/4 space-y-4 overflow-y-auto">
        {LAB_SCENARIOS.map((lab) => (
          <div 
            key={lab.id} 
            onClick={() => startLab(lab.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedScenario === lab.id 
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold">{lab.title}</h3>
              <span className={`text-xs px-2 py-1 rounded bg-black/20`}>{lab.difficulty}</span>
            </div>
            <p className={`text-sm ${selectedScenario === lab.id ? 'text-blue-100' : 'text-slate-500'}`}>
              {lab.description}
            </p>
          </div>
        ))}
      </div>

      {/* Terminal Interface */}
      <div className="lg:w-3/4 flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-slate-400 text-sm font-mono">ssh admin@192.168.1.1</span>
          </div>
          {isSuccess && (
            <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded animate-pulse">
              LAB COMPLETED
            </span>
          )}
        </div>

        <div className="flex-1 p-4 font-mono text-sm overflow-y-auto text-slate-300">
          {!selectedScenario && (
             <div className="h-full flex items-center justify-center text-slate-600">
               Select a lab scenario to power on the device.
             </div>
          )}
          {terminalOutput.map((line, idx) => (
            <div key={idx} className="mb-1 whitespace-pre-wrap">
              {line.type === 'input' && <span className="text-yellow-400 mr-2">$</span>}
              {line.type === 'system' && <span className="text-blue-400 font-bold">[SYSTEM] </span>}
              <span className={line.type === 'output' ? 'text-slate-300' : line.type === 'input' ? 'text-white' : ''}>
                 {line.text.replace("LAB_SUCCESS", "")}
              </span>
            </div>
          ))}
          {isProcessing && <div className="text-slate-500 animate-pulse">Processing...</div>}
          <div ref={terminalEndRef} />
        </div>

        {selectedScenario && (
          <form onSubmit={handleCommand} className="p-4 bg-slate-800 border-t border-slate-700">
            <div className="flex items-center">
              <span className="text-green-400 mr-2 font-mono">{'>'}</span>
              <input 
                autoFocus
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono placeholder-slate-600 focus:outline-none"
                placeholder="Enter command (e.g., enable, conf t)..."
                disabled={isProcessing}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LabSimulator;