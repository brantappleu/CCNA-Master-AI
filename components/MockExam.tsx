import React, { useState, useEffect } from 'react';
import { CCNA_DOMAINS, STUDY_TOPICS } from '../constants';
import { generateExamQuestions, generateFullMockExam } from '../services/geminiService';
import { ExamQuestion } from '../types';
import { CheckCircle, XCircle, Play, Loader, Clock, Flag, Trophy, PieChart, Target, ArrowLeft, AlertTriangle, FileText, Monitor } from 'lucide-react';

interface ExtendedQuestion extends ExamQuestion {
  userAnswer?: number;
  marked?: boolean;
  domain?: string;
}

type ExamStage = 'selection' | 'drill-setup' | 'sim-intro' | 'active' | 'review';
type ExamMode = 'drill' | 'simulation';

interface MockExamProps {
  initialMode?: ExamMode;
}

const MockExam: React.FC<MockExamProps> = ({ initialMode }) => {
  // If initialMode is provided (via sidebar), skip selection. 
  // If no initialMode (generic entry), show selection.
  const [stage, setStage] = useState<ExamStage>(
    initialMode === 'drill' ? 'drill-setup' : 
    initialMode === 'simulation' ? 'sim-intro' : 
    'selection'
  );
  
  const [examMode, setExamMode] = useState<ExamMode>(initialMode || 'drill');
  
  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Drill Settings
  const [drillScope, setDrillScope] = useState<'domain' | 'topic'>('domain');
  const [selectedDrillTarget, setSelectedDrillTarget] = useState(CCNA_DOMAINS[0]);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Sync prop changes if menu is clicked while component is mounted
  useEffect(() => {
    if (initialMode) {
      setExamMode(initialMode);
      setStage(initialMode === 'drill' ? 'drill-setup' : 'sim-intro');
      setQuestions([]); // Reset questions on mode switch
      setCurrentQuestionIdx(0);
    }
  }, [initialMode]);

  // Timer Effect
  useEffect(() => {
    let timer: any;
    if (stage === 'active' && timeLeft > 0) {
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
  }, [stage, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- Actions ---

  const handleModeSelect = (mode: ExamMode) => {
    setExamMode(mode);
    setStage(mode === 'drill' ? 'drill-setup' : 'sim-intro');
  };

  const generateExam = async () => {
    setLoading(true);
    try {
      let data: ExtendedQuestion[] = [];
      
      if (examMode === 'drill') {
        const jsonStr = await generateExamQuestions(selectedDrillTarget, 5);
        data = JSON.parse(jsonStr).map((q: any) => ({ ...q, domain: selectedDrillTarget }));
        setTimeLeft(0); 
      } else {
        // Simulation: 30 Questions, 45 Minutes
        const jsonStr = await generateFullMockExam(30); 
        data = JSON.parse(jsonStr);
        setTimeLeft(45 * 60); 
      }

      setQuestions(data);
      setStage('active');
      setCurrentQuestionIdx(0);
    } catch (e) {
      console.error(e);
      alert("Failed to generate questions. Please check API Key/Connection.");
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
    setStage('review');
  };

  const calculateScore = () => {
    const correctCount = questions.filter(q => q.userAnswer === q.correctAnswer).length;
    const total = questions.length;
    // Cisco Scaling: 300 to 1000
    const score = Math.round(300 + (correctCount / total) * 700);
    const isPass = score >= 825;

    // Domain Stats
    const domainStats: Record<string, { correct: number, total: number }> = {};
    questions.forEach(q => {
      const d = q.domain || 'General';
      if (!domainStats[d]) domainStats[d] = { correct: 0, total: 0 };
      domainStats[d].total++;
      if (q.userAnswer === q.correctAnswer) domainStats[d].correct++;
    });

    return { score, isPass, correctCount, total, domainStats };
  };

  const resetExam = () => {
    if (initialMode) {
        // If mode is forced (sidebar), return to that mode's setup
        setStage(initialMode === 'drill' ? 'drill-setup' : 'sim-intro');
    } else {
        setStage('selection');
    }
    setQuestions([]);
  };

  // --- Renders ---

  // 1. Selection Screen (Only if no initialMode is passed)
  if (stage === 'selection') {
    return (
      <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Exam Center</h1>
          <p className="text-slate-500 text-lg">Select your assessment mode to begin.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card: Drill */}
          <button 
            onClick={() => handleModeSelect('drill')}
            className="group relative bg-white p-8 rounded-2xl shadow-md border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl transition-all text-left flex flex-col h-full"
          >
            <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <Target className="w-8 h-8 text-blue-600 group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Topic Drill</h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Target specific knowledge domains or topics. Best for strengthening weak areas and quick practice sessions.
            </p>
            <div className="mt-auto flex items-center text-blue-600 font-bold">
              <span>Configure Drill</span>
              <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </div>
          </button>

          {/* Card: Simulation */}
          <button 
            onClick={() => handleModeSelect('simulation')}
            className="group relative bg-slate-900 p-8 rounded-2xl shadow-xl border-2 border-slate-800 hover:border-blue-400 hover:shadow-2xl transition-all text-left flex flex-col h-full overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">OFFICIAL MODE</div>
            
            <div className="bg-slate-800 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
              <Trophy className="w-8 h-8 text-blue-400 group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Full Exam Simulator</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Realistic CCNA certification experience. Weighted questions, timed environment (45m), and official scoring logic.
            </p>
            <div className="mt-auto flex items-center text-blue-400 font-bold group-hover:text-white">
              <span>Enter Exam Environment</span>
              <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 2. Drill Setup
  if (stage === 'drill-setup') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-10">
        <div className="p-6 border-b border-slate-100 flex items-center">
           {!initialMode && (
               <button onClick={() => setStage('selection')} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <ArrowLeft className="w-5 h-5 text-slate-500" />
               </button>
           )}
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Target className="w-5 h-5 text-blue-600" />
             Configure Practice Drill
           </h2>
        </div>
        
        <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => { setDrillScope('domain'); setSelectedDrillTarget(CCNA_DOMAINS[0]); }}
                    className={`py-3 px-4 rounded-lg font-bold border-2 transition-all ${drillScope === 'domain' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                    By Domain
                </button>
                <button 
                    onClick={() => { setDrillScope('topic'); setSelectedDrillTarget(STUDY_TOPICS[0].title); }}
                    className={`py-3 px-4 rounded-lg font-bold border-2 transition-all ${drillScope === 'topic' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                    By Topic
                </button>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Select {drillScope === 'domain' ? 'Knowledge Domain' : 'Specific Topic'}
                </label>
                <select 
                    className="w-full p-4 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={selectedDrillTarget}
                    onChange={(e) => setSelectedDrillTarget(e.target.value)}
                >
                    {drillScope === 'domain' 
                    ? CCNA_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)
                    : STUDY_TOPICS.map(t => <option key={t.id} value={t.title}>{t.title} ({t.domain})</option>)
                    }
                </select>
            </div>

            <button 
                onClick={generateExam}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-3 transition-all shadow-lg"
            >
                {loading ? <Loader className="animate-spin w-6 h-6" /> : <Play className="w-6 h-6" />}
                <span className="text-lg">Generate Drill Questions</span>
            </button>
        </div>
      </div>
    );
  }

  // 3. Simulation Intro (Pearson VUE Style)
  if (stage === 'sim-intro') {
    return (
        <div className="max-w-4xl mx-auto mt-6">
            <div className="mb-6 flex items-center">
               {!initialMode && (
                   <button onClick={() => setStage('selection')} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium">
                     <ArrowLeft className="w-4 h-4 mr-2" /> Back to Selection
                   </button>
               )}
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-blue-700 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <Monitor className="w-5 h-5 text-blue-300" />
                                <span className="text-blue-200 font-mono text-sm uppercase tracking-wider">Exam Simulator v2.4</span>
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tight">Cisco Certified Network Associate</h2>
                            <p className="text-blue-100 mt-1 font-medium">Exam Code: 200-301</p>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">
                            <span className="text-xs text-blue-200 block uppercase">Candidate</span>
                            <span className="font-mono font-bold">ADMIN USER</span>
                        </div>
                    </div>
                </div>

                <div className="p-10">
                    <div className="grid md:grid-cols-3 gap-8 mb-10">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Clock className="w-5 h-5" /></div>
                                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Duration</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">45 Minutes</div>
                            <div className="text-sm text-slate-500">Strictly timed</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileText className="w-5 h-5" /></div>
                                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Format</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">30 Questions</div>
                            <div className="text-sm text-slate-500">Weighted Domains</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Target className="w-5 h-5" /></div>
                                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Pass Mark</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">825 / 1000</div>
                            <div className="text-sm text-slate-500">Official Scale</div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10 flex items-start space-x-4">
                         <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                         <div className="text-sm text-amber-900 leading-relaxed">
                            <strong>Candidate Agreement:</strong> By proceeding, you agree that this simulation is for educational purposes. 
                            The AI generates questions based on the public exam blueprint.
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-amber-800">
                                <li>The timer begins immediately upon clicking start.</li>
                                <li>You may flag questions for review.</li>
                                <li>Results are provided immediately upon submission.</li>
                            </ul>
                         </div>
                    </div>

                    <button 
                        onClick={generateExam}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-5 rounded-xl shadow-xl shadow-blue-200 hover:shadow-2xl transition-all flex items-center justify-center space-x-3 hover:-translate-y-1 active:translate-y-0"
                    >
                         {loading ? <Loader className="animate-spin w-6 h-6" /> : <Play className="w-6 h-6" />}
                         <span>Agree & Start Exam Simulation</span>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // 4. Active Exam & 5. Review (Shared Result Logic)
  
  // REVIEW STATE
  if (stage === 'review') {
    const { score, isPass, correctCount, total, domainStats } = calculateScore();
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className={`p-10 text-center border-b ${isPass ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Exam Result Report</h2>
                    <div className="flex items-baseline justify-center space-x-2 mb-6">
                        <span className={`text-7xl font-black tracking-tighter ${isPass ? 'text-green-600' : 'text-red-600'}`}>{score}</span>
                        <span className="text-slate-400 font-medium text-2xl">/ 1000</span>
                    </div>
                    
                    <div className="flex justify-center">
                      {isPass ? (
                          <div className="flex items-center px-6 py-2 rounded-full bg-green-600 text-white font-bold shadow-md">
                              <CheckCircle className="w-5 h-5 mr-2" /> PASSED
                          </div>
                      ) : (
                          <div className="flex items-center px-6 py-2 rounded-full bg-red-600 text-white font-bold shadow-md">
                              <XCircle className="w-5 h-5 mr-2" /> FAILED
                          </div>
                      )}
                    </div>
                </div>

                {examMode === 'simulation' && (
                  <div className="p-8 border-b border-slate-100">
                    <h3 className="flex items-center text-lg font-bold text-slate-800 mb-6">
                      <PieChart className="w-5 h-5 mr-2 text-blue-500" />
                      Domain Performance Breakdown
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.entries(domainStats).map(([domain, stats]) => {
                        const percent = Math.round((stats.correct / stats.total) * 100);
                        return (
                          <div key={domain} className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-slate-700 truncate pr-2">{domain}</span>
                              <span className={`font-bold ${percent >= 70 ? 'text-green-600' : 'text-red-500'}`}>{percent}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className={`h-full ${percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="p-8 bg-slate-50">
                    <h3 className="font-bold text-lg mb-6 text-slate-800">Detailed Question Review</h3>
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
                        onClick={resetExam}
                        className="mt-8 w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                    >
                        Return to {initialMode === 'simulation' ? 'Exam Intro' : 'Setup'}
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // ACTIVE STATE
  const currentQ = questions[currentQuestionIdx];
  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
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
            {examMode === 'simulation' && (
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

        <div className="flex items-center justify-between">
        <button
            onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
            disabled={currentQuestionIdx === 0}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-50 font-bold transition-colors"
        >
            Previous
        </button>

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