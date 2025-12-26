import React, { useState, useEffect } from 'react';
import { CCNA_DOMAINS, STUDY_TOPICS } from '../constants';
import { generateExamQuestions, generateFullMockExam } from '../services/geminiService';
import { ExamQuestion } from '../types';
import { CheckCircle, XCircle, Play, Loader, Clock, Flag, Trophy, PieChart, Target, ArrowRight } from 'lucide-react';

interface ExtendedQuestion extends ExamQuestion {
  userAnswer?: number;
  marked?: boolean;
  domain?: string;
}

const MockExam: React.FC = () => {
  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Drill Settings
  const [drillMode, setDrillMode] = useState<'domain' | 'topic'>('domain');
  const [selectedDrillTarget, setSelectedDrillTarget] = useState(CCNA_DOMAINS[0]);

  // Exam Modes: 'drill' (Specific) vs 'simulation' (Full Mock)
  const [mode, setMode] = useState<'drill' | 'simulation'>('drill');
  
  // States: 'setup' -> 'active' -> 'review'
  const [examState, setExamState] = useState<'setup' | 'active' | 'review'>('setup');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  // Timer state (in seconds)
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer Effect
  useEffect(() => {
    let timer: any;
    if (examState === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examState, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startExam = async (examMode: 'drill' | 'simulation') => {
    setMode(examMode);
    setLoading(true);
    try {
      let data: ExtendedQuestion[] = [];
      
      if (examMode === 'drill') {
        // Generate questions for specific domain or topic
        const jsonStr = await generateExamQuestions(selectedDrillTarget, 5);
        data = JSON.parse(jsonStr).map((q: any) => ({ ...q, domain: selectedDrillTarget }));
        setTimeLeft(0); 
      } else {
        // Simulation Mode: Full CCNA mix
        const jsonStr = await generateFullMockExam(20);
        data = JSON.parse(jsonStr);
        setTimeLeft(30 * 60); 
      }

      setQuestions(data);
      setExamState('active');
      setCurrentQuestionIdx(0);
    } catch (e) {
      console.error(e);
      alert("Failed to generate questions. Please ensure API Key is valid and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIdx].userAnswer = optionIdx;
    setQuestions(updatedQuestions);
  };

  const toggleMark = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIdx].marked = !updatedQuestions[currentQuestionIdx].marked;
    setQuestions(updatedQuestions);
  }

  const submitExam = () => {
    setExamState('review');
  };

  const calculateScore = () => {
    const correctCount = questions.filter(q => q.userAnswer === q.correctAnswer).length;
    const total = questions.length;
    // Simulate Cisco Scoring: Scale 300 to 1000
    // Formula: 300 + (Correct / Total) * 700
    const score = Math.round(300 + (correctCount / total) * 700);
    const isPass = score >= 825;

    // Domain Breakdown
    const domainStats: Record<string, { correct: number, total: number }> = {};
    questions.forEach(q => {
      const d = q.domain || 'General';
      if (!domainStats[d]) domainStats[d] = { correct: 0, total: 0 };
      domainStats[d].total++;
      if (q.userAnswer === q.correctAnswer) domainStats[d].correct++;
    });

    return { score, isPass, correctCount, total, domainStats };
  };

  // --- Render Setup Screen ---
  if (examState === 'setup') {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Exam Center</h1>
          <p className="text-slate-500">Choose your assessment mode designed to mirror the official Cisco environment.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Drill Mode Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
               <div className="flex items-center space-x-3 mb-2">
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Target className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-800">Precision Drill</h2>
               </div>
               <p className="text-sm text-slate-600">Master specific weak points. Select a broad Domain or a specific Study Topic.</p>
            </div>
            
            <div className="p-6 flex-1 flex flex-col space-y-6">
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => { setDrillMode('domain'); setSelectedDrillTarget(CCNA_DOMAINS[0]); }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${drillMode === 'domain' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                  >
                    By Domain
                  </button>
                  <button 
                    onClick={() => { setDrillMode('topic'); setSelectedDrillTarget(STUDY_TOPICS[0].title); }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${drillMode === 'topic' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                  >
                    By Topic
                  </button>
                </div>

                <div className="relative">
                  <select 
                    className="w-full p-3 pl-4 pr-10 appearance-none bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    value={selectedDrillTarget}
                    onChange={(e) => setSelectedDrillTarget(e.target.value)}
                  >
                    {drillMode === 'domain' 
                      ? CCNA_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)
                      : STUDY_TOPICS.map(t => <option key={t.id} value={t.title}>{t.title} ({t.domain})</option>)
                    }
                  </select>
                  <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <button 
                  onClick={() => startExam('drill')}
                  disabled={loading}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-lg flex items-center justify-center space-x-2 transition-all"
                >
                  {loading && mode === 'drill' ? <Loader className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>Start Custom Drill</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Mode Card */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden flex flex-col h-full relative group">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">RECOMMENDED</div>
            
            <div className="p-6 border-b border-blue-50 bg-blue-50/30">
               <div className="flex items-center space-x-3 mb-2">
                 <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
                    <Trophy className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-800">Full CCNA Simulation</h2>
               </div>
               <p className="text-sm text-slate-600">Complete mock exam reflecting the official weighting.</p>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600">Question Count</span>
                  <span className="font-mono font-bold text-slate-800">20 Questions</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded border border-slate-100">
                   <span className="text-slate-600">Time Limit</span>
                   <span className="font-mono font-bold text-slate-800">30 Minutes</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded border border-slate-100">
                   <span className="text-slate-600">Passing Score</span>
                   <span className="font-mono font-bold text-slate-800">825 / 1000</span>
                </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => startExam('simulation')}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-200 hover:shadow-lg"
                >
                  {loading && mode === 'simulation' ? <Loader className="animate-spin w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  <span>Start Mock Exam</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Result Screen ---
  if (examState === 'review') {
    const { score, isPass, correctCount, total, domainStats } = calculateScore();
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
                {/* Header Score */}
                <div className={`p-8 text-center border-b ${isPass ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Exam Report</h2>
                    <div className="flex items-baseline justify-center space-x-2 mb-6">
                        <span className={`text-6xl font-black ${isPass ? 'text-green-600' : 'text-red-600'}`}>{score}</span>
                        <span className="text-slate-400 font-medium text-xl">/ 1000</span>
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      {isPass ? (
                          <div className="flex items-center px-6 py-2 rounded-full bg-green-100 text-green-800 font-bold shadow-sm">
                              <CheckCircle className="w-5 h-5 mr-2" /> PASSED
                          </div>
                      ) : (
                          <div className="flex items-center px-6 py-2 rounded-full bg-red-100 text-red-800 font-bold shadow-sm">
                              <XCircle className="w-5 h-5 mr-2" /> FAILED
                          </div>
                      )}
                    </div>
                    <p className="mt-4 text-slate-500 font-medium">Passing Score: 825</p>
                </div>

                {/* Domain Breakdown */}
                {mode === 'simulation' && (
                  <div className="p-8 border-b border-slate-100">
                    <h3 className="flex items-center text-lg font-bold text-slate-800 mb-6">
                      <PieChart className="w-5 h-5 mr-2 text-blue-500" />
                      Domain Performance
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(domainStats).map(([domain, stats]) => {
                        const percent = Math.round((stats.correct / stats.total) * 100);
                        return (
                          <div key={domain} className="bg-slate-50 p-4 rounded-lg">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-slate-700 truncate pr-2">{domain}</span>
                              <span className="font-bold text-slate-900">{percent}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${percent >= 70 ? 'bg-green-500' : percent >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Detailed Review */}
                <div className="p-8 bg-slate-50">
                    <h3 className="font-bold text-lg mb-6 text-slate-800">Detailed Answer Review</h3>
                    <div className="space-y-6">
                        {questions.map((q, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white mr-3 ${q.userAnswer === q.correctAnswer ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {idx + 1}
                                      </span>
                                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        {q.domain || 'General'}
                                      </span>
                                    </div>
                                    {q.marked && <Flag className="w-4 h-4 text-orange-500" fill="currentColor" />}
                                </div>
                                <p className="mb-4 font-medium text-slate-800 text-lg leading-relaxed">{q.question}</p>
                                
                                <div className="space-y-2 mb-4">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className={`flex items-center p-3 rounded-lg border text-sm ${
                                            i === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-900 font-semibold' : 
                                            i === q.userAnswer ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-slate-100 text-slate-600'
                                        }`}>
                                            <span className="w-6">{String.fromCharCode(65+i)}.</span>
                                            <span>{opt}</span>
                                            {i === q.correctAnswer && <CheckCircle className="w-4 h-4 ml-auto text-green-600" />}
                                            {i === q.userAnswer && i !== q.correctAnswer && <XCircle className="w-4 h-4 ml-auto text-red-600" />}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Explanation / 解析</h4>
                                    <p className="text-slate-700 text-sm leading-relaxed">{q.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setExamState('setup')}
                        className="mt-8 w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                    >
                        Return to Exam Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- Render Active Exam Screen ---
  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Exam Header */}
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-slate-800">Q{currentQuestionIdx + 1}</span>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Domain</span>
              <span className="text-sm font-medium text-slate-600">{currentQ.domain || 'CCNA Exam'}</span>
            </div>
        </div>
        
        <div className="flex items-center space-x-6">
            {mode === 'simulation' && (
                <div className={`flex items-center space-x-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                    <Clock className="w-5 h-5" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            )}
            <button 
                onClick={toggleMark}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${currentQ.marked ? 'bg-orange-50 border-orange-200 text-orange-600 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
                <Flag className="w-4 h-4" fill={currentQ.marked ? "currentColor" : "none"} />
                <span>{currentQ.marked ? 'Marked' : 'Mark'}</span>
            </button>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 bg-white p-8 md:p-10 rounded-xl shadow-lg border border-slate-200 overflow-y-auto mb-6 relative">
        <div className="max-w-3xl mx-auto">
           <p className="text-2xl text-slate-900 font-medium leading-relaxed mb-10">{currentQ.question}</p>
        
           <div className="space-y-4">
            {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center group ${
                      currentQ.userAnswer === idx 
                      ? "border-blue-600 bg-blue-50/50 shadow-sm" 
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mr-5 font-bold text-lg transition-colors flex-shrink-0 ${
                      currentQ.userAnswer === idx
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500"
                  }`}>
                      {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`text-lg ${currentQ.userAnswer === idx ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                      {opt}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
          disabled={currentQuestionIdx === 0}
          className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-50 font-bold transition-colors"
        >
          Previous
        </button>

        {/* Progress Bar (Visual) */}
        <div className="hidden md:flex flex-1 mx-8 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
            ></div>
        </div>

        {currentQuestionIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-transform active:scale-95"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={submitExam}
            className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-200 flex items-center space-x-2 transition-transform active:scale-95"
          >
            <span>Finish Exam</span>
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MockExam;